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

function toPascalCase(str: string): string {
  if (!str) return "";
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).replace(/[^a-zA-Z0-9]/g, ""))
    .join("");
}

function toCamelCase(str: string): string {
  if (!str) return "";
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function formatIndonesianDate(dateStr: string): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

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
  const body = await request.json();

  await updateJurnal(id, {
    tanggal: body.tanggal,
    nama_item: body.nama_item,
    jumlah_terjual: body.jumlah_terjual !== undefined ? Number(body.jumlah_terjual) : undefined,
    total_pendapatan: body.total_pendapatan !== undefined ? Number(body.total_pendapatan) : undefined,
    keterangan: body.keterangan,
    url_nota: body.url_nota,
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
  const namaItem = (formData.get("nama_item") as string) || "";
  const jumlahTerjual = Number(formData.get("jumlah_terjual") || "0");
  const totalPendapatan = Number(formData.get("total_pendapatan") || "0");
  const keterangan = (formData.get("keterangan") as string) || "";
  let finalUrlNota = (formData.get("url_nota") as string) || "";
  const isEdit = formData.get("isEdit") === "true";

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
