import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { appendJurnal, getJurnalListing } from "@/lib/db/queries/jurnal";
import { adminAuth } from "@/lib/db/schema";
import { uploadToTelegram } from "@/lib/telegram-storage";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { JurnalItemRow } from "@/types/db";
import { toPascalCase, toCamelCase, formatIndonesianDate } from "@/lib/utils";

export interface JurnalPayloadItem {
  produk_id?: string | null;
  nama_item: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
  satuan?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const q = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";
    const ownerIdParam = searchParams.get("ownerId");
    const ownerId = ownerIdParam ? parseInt(ownerIdParam, 10) : undefined;
    const sort = searchParams.get("sort") || undefined;
    const dir = searchParams.get("dir") || undefined;

    const result = await getJurnalListing({
      page,
      limit,
      q,
      filter,
      ownerId,
      sort,
      dir,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching jurnal:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data jurnal penjualan." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    if (isFormData) {
      return handleFormDataPost(request);
    }

    return handleJsonPost(request);
  } catch (error) {
    console.error("Error adding jurnal:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan jurnal penjualan." },
      { status: 500 }
    );
  }
}

async function handleJsonPost(request: NextRequest) {
  const session = await requireRole(["super_admin", "kontributor"]);
  if (!session) {
    return NextResponse.json(
      { error: "Sesi tidak valid, silakan login ulang." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const items: JurnalPayloadItem[] = body.items || [];
  let totalQty = 0;
  let totalPendapatan = 0;
  let namaItem = "";

  if (items.length > 0) {
    const itemNames = items.map((i) => i.nama_item);
    if (itemNames.length === 1) {
      namaItem = itemNames[0];
    } else {
      namaItem = `${itemNames[0]} (+${itemNames.length - 1} lainnya)`;
    }
    items.forEach((item) => {
      totalQty += Number(item.jumlah);
      totalPendapatan += Number(item.subtotal);
    });
  } else {
    namaItem = body.nama_item;
    totalQty = Number(body.jumlah_terjual);
    totalPendapatan = Number(body.total_pendapatan);
  }

  if (!body.tanggal || !namaItem || totalQty < 1 || totalPendapatan <= 0) {
    return NextResponse.json(
      { error: "Data wajib tidak lengkap." },
      { status: 400 }
    );
  }

  await appendJurnal({
    tanggal: body.tanggal,
    nama_item: namaItem,
    jumlah_terjual: totalQty,
    total_pendapatan: totalPendapatan,
    keterangan: body.keterangan || "",
    url_nota: body.url_nota || "",
    created_by: session.id,
    items: items.length > 0 ? (items as unknown as JurnalItemRow[]) : undefined,
  });

  revalidateTag("jurnal", "max");

  return NextResponse.json(
    { message: "Jurnal penjualan berhasil ditambahkan." },
    { status: 201 }
  );
}

/**
 * Single-request flow: upload nota + save jurnal in one round-trip.
 * File upload to Telegram and user info fetch run in parallel.
 */
async function handleFormDataPost(request: NextRequest) {
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

  let finalUrlNota = "";

  if (file && file.size > 0) {
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
    const caption = `📝 Nota Penjualan\n📦 Produk: ${namaItem}\n👤 Oleh: ${kelompokRaw}\n📅 Tanggal: ${cleanTanggal}`;

    const fileId = await uploadToTelegram(buffer, fileName, caption);
    finalUrlNota = `/api/jurnal/nota/${fileId}`;
  }

  await appendJurnal({
    tanggal,
    nama_item: namaItem,
    jumlah_terjual: jumlahTerjual,
    total_pendapatan: totalPendapatan,
    keterangan,
    url_nota: finalUrlNota,
    created_by: session.id,
    items: items.length > 0 ? (items as unknown as JurnalItemRow[]) : undefined,
  });

  revalidateTag("jurnal", "max");

  return NextResponse.json(
    { success: true, message: "Jurnal penjualan berhasil ditambahkan." },
    { status: 201 }
  );
}
