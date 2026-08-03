import { deleteJurnalById, getJurnalById, updateJurnal } from "@/lib/db/queries/jurnal";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getJurnalById(id);

    if (!data) {
      return NextResponse.json(
        { error: "Jurnal penjualan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jurnal by id:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data jurnal penjualan." },
      { status: 500 }
    );
  }
}

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminAuth } from "@/lib/db/schema";
import { uploadToTelegram } from "@/lib/telegram-storage";
import { eq } from "drizzle-orm";
import type { JurnalPayloadItem } from "../route";
import { JurnalItemRow } from "@/types/db";
import { toPascalCase, toCamelCase, formatIndonesianDate } from "@/lib/utils";
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return handleFormDataPut(request, id);
    }
    
    return handleJsonPut(request, id);
  } catch (error) {
    console.error("Error updating jurnal:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui jurnal penjualan." },
      { status: 500 }
    );
  }
}

async function handleJsonPut(request: NextRequest, id: string) {
  const session = await requireRole(["super_admin", "kontributor"]);
  if (!session) {
    return NextResponse.json(
      { error: "Sesi tidak valid, silakan login ulang." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const items: JurnalPayloadItem[] = body.items || [];
  let totalQty: number | undefined = undefined;
  let totalPendapatan: number | undefined = undefined;
  let namaItem = body.nama_item;

  if (items.length > 0) {
    const itemNames = items.map((i) => i.nama_item);
    if (itemNames.length === 1) {
      namaItem = itemNames[0];
    } else {
      namaItem = `${itemNames[0]} (+${itemNames.length - 1} lainnya)`;
    }
    totalQty = 0;
    totalPendapatan = 0;
    items.forEach((item) => {
      totalQty! += Number(item.jumlah);
      totalPendapatan! += Number(item.subtotal);
    });
  } else if (body.jumlah_terjual !== undefined && body.total_pendapatan !== undefined) {
    totalQty = Number(body.jumlah_terjual);
    totalPendapatan = Number(body.total_pendapatan);
  }

  if (!body.tanggal || !namaItem || totalQty === undefined || totalPendapatan === undefined || totalQty < 1 || totalPendapatan < 0) {
    return NextResponse.json(
      { error: "Data wajib tidak lengkap." },
      { status: 400 }
    );
  }

  await updateJurnal(id, {
    tanggal: body.tanggal,
    nama_item: namaItem,
    jumlah_terjual: totalQty,
    total_pendapatan: totalPendapatan,
    keterangan: body.keterangan,
    url_nota: body.url_nota,
    items: items.length > 0 ? (items as unknown as JurnalItemRow[]) : undefined,
  });

  revalidateTag("jurnal", "max");

  return NextResponse.json({ message: "Jurnal penjualan berhasil diperbarui." });
}

async function handleFormDataPut(request: NextRequest, id: string) {
  const session = await requireRole(["super_admin", "kontributor"]);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  const formData = await request.formData();

  const file = formData.get("file") as File | null;
  const tanggal = (formData.get("tanggal") as string) || new Date().toISOString().split("T")[0];
  const keterangan = (formData.get("keterangan") as string) || "";
  let finalUrlNota = (formData.get("url_nota") as string) || "";
  const isEdit = formData.get("isEdit") === "true";
  
  const itemsStr = formData.get("items") as string;
  let items: JurnalPayloadItem[] = [];
  try {
    if (itemsStr) items = JSON.parse(itemsStr);
  } catch {
    return NextResponse.json(
      { success: false, message: "Format items tidak valid." },
      { status: 400 }
    );
  }

  let namaItem = "";
  let jumlahTerjual = 0;
  let totalPendapatan = 0;

  if (items.length > 0) {
    const itemNames = items.map((i) => i.nama_item);
    if (itemNames.length === 1) {
      namaItem = itemNames[0];
    } else {
      namaItem = `${itemNames[0]} (+${itemNames.length - 1} lainnya)`;
    }
    items.forEach((item) => {
      jumlahTerjual += Number(item.jumlah);
      totalPendapatan += Number(item.subtotal);
    });
  } else {
    namaItem = (formData.get("nama_item") as string) || "";
    jumlahTerjual = Number(formData.get("jumlah_terjual") || "0");
    totalPendapatan = Number(formData.get("total_pendapatan") || "0");
  }

  if (!namaItem || jumlahTerjual < 1 || totalPendapatan <= 0) {
    return NextResponse.json(
      { success: false, message: "Data wajib tidak lengkap." },
      { status: 400 }
    );
  }

  if (file && file.size > 0) {
    // Parallelkan: baca file buffer + ambil info user dari DB secara bersamaan
    const [arrayBuffer, users] = await Promise.all([
      file.arrayBuffer(),
      db
        .select({ nama: adminAuth.nama, username: adminAuth.username })
        .from(adminAuth)
        .where(eq(adminAuth.id, session.id))
        .limit(1),
    ]);

    const buffer = Buffer.from(arrayBuffer);
    const user = users[0];
    const kelompokRaw = user?.nama || user?.username || "Kontributor";
    const cleanKelompok = toPascalCase(kelompokRaw);

    const cleanNamaProduk = toCamelCase(namaItem);
    const cleanTanggal = formatIndonesianDate(tanggal);
    const fileExtension = file.name.split(".").pop() || "jpg";

    const fileName = `${cleanNamaProduk}_${cleanKelompok}_${cleanTanggal}.${fileExtension}`;
    
    // Add edit flag to caption if it's an edit
    const editPrefix = isEdit ? "[EDIT] " : "";
    const caption = `📝 ${editPrefix}Nota Penjualan\n📦 Produk: ${namaItem}\n👤 Oleh: ${kelompokRaw}\n📅 Tanggal: ${cleanTanggal}`;

    const fileId = await uploadToTelegram(buffer, fileName, caption);
    finalUrlNota = `/api/jurnal/nota/${fileId}`;
  }

  await updateJurnal(id, {
    tanggal,
    nama_item: namaItem,
    jumlah_terjual: jumlahTerjual,
    total_pendapatan: totalPendapatan,
    keterangan,
    url_nota: finalUrlNota,
    items: items.length > 0 ? (items as unknown as JurnalItemRow[]) : undefined,
  });

  revalidateTag("jurnal", "max");

  return NextResponse.json(
    { success: true, message: "Jurnal penjualan berhasil diperbarui." },
    { status: 200 }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteJurnalById(id);

    if (!success) {
      return NextResponse.json(
        { error: "Jurnal penjualan tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }

    revalidateTag("jurnal", "max");

    return NextResponse.json({ message: "Jurnal penjualan berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting jurnal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus jurnal penjualan." },
      { status: 500 }
    );
  }
}
