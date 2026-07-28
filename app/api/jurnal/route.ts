import { NextRequest, NextResponse } from "next/server";
import { getJurnalListing, appendJurnal } from "@/lib/db/queries/jurnal";
import { revalidateTag } from "next/cache";
import { getSession, requireRole } from "@/lib/auth";
import { uploadToTelegram } from "@/lib/telegram-storage";
import { db } from "@/lib/db";
import { adminAuth } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sesi tidak valid, silakan login ulang." },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (!body.tanggal || !body.nama_item || body.jumlah_terjual === undefined || body.total_pendapatan === undefined) {
    return NextResponse.json(
      { error: "Data wajib tidak lengkap." },
      { status: 400 }
    );
  }

  await appendJurnal({
    tanggal: body.tanggal,
    nama_item: body.nama_item,
    jumlah_terjual: Number(body.jumlah_terjual),
    total_pendapatan: Number(body.total_pendapatan),
    keterangan: body.keterangan || "",
    url_nota: body.url_nota || "",
    created_by: session.id,
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
  const namaItem = (formData.get("nama_item") as string) || "";
  const jumlahTerjual = Number(formData.get("jumlah_terjual") || "0");
  const totalPendapatan = Number(formData.get("total_pendapatan") || "0");
  const keterangan = (formData.get("keterangan") as string) || "";

  if (!namaItem || jumlahTerjual < 1 || totalPendapatan <= 0) {
    return NextResponse.json(
      { success: false, message: "Data wajib tidak lengkap." },
      { status: 400 }
    );
  }

  let finalUrlNota = "";

  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run Telegram upload and user info fetch in parallel
    const userQueryPromise = db
      .select({ nama: adminAuth.nama, username: adminAuth.username })
      .from(adminAuth)
      .where(eq(adminAuth.id, session.id))
      .limit(1);

    const cleanNamaProduk = toCamelCase(namaItem);
    const cleanTanggal = formatIndonesianDate(tanggal);
    const fileExtension = file.name.split(".").pop() || "jpg";

    const [users] = await Promise.all([userQueryPromise]);
    const user = users[0];
    const kelompokRaw = user?.nama || user?.username || "Kontributor";
    const cleanKelompok = toPascalCase(kelompokRaw);

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
  });

  revalidateTag("jurnal", "max");

  return NextResponse.json(
    { success: true, message: "Jurnal penjualan berhasil ditambahkan." },
    { status: 201 }
  );
}
