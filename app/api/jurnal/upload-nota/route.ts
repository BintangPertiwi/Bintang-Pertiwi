import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminAuth } from "@/lib/db/schema";
import { uploadToGoogleDrive } from "@/lib/google-drive";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
    return `${now.getDate()}${months[now.getMonth()]}${now.getFullYear()}`;
  }
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}${month}${year}`;
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["super_admin", "kontributor"]);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const namaProdukRaw = formData.get("namaProduk") as string | null;
    const tanggalRaw = formData.get("tanggal") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Berkas nota wajib diunggah." },
        { status: 400 }
      );
    }

    // Fetch contributor's UMKM name
    const users = await db
      .select({ nama: adminAuth.nama, username: adminAuth.username })
      .from(adminAuth)
      .where(eq(adminAuth.id, session.id))
      .limit(1);

    const user = users[0];
    const kelompokRaw = user?.nama || user?.username || "Kontributor";

    // Format file name: namaProduk_kelompokUMKM_tanggal.extension
    const cleanNamaProduk = toCamelCase(namaProdukRaw || "produk");
    const cleanKelompok = toPascalCase(kelompokRaw);
    const cleanTanggal = formatIndonesianDate(tanggalRaw || new Date().toISOString());

    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${cleanNamaProduk}_${cleanKelompok}_${cleanTanggal}.${fileExtension}`;

    // Read file into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive
    const directViewUrl = await uploadToGoogleDrive(buffer, fileName, file.type);

    return NextResponse.json({
      success: true,
      url: directViewUrl,
      fileName,
    });
  } catch (error) {
    console.error("Error uploading receipt to Google Drive:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengunggah nota ke Google Drive." },
      { status: 500 }
    );
  }
}
