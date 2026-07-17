import { NextResponse } from "next/server";
import { appendGaleri } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { judul, kategori, deskripsi, url_foto } = body;

    if (!url_foto || !kategori) {
      return NextResponse.json(
        { success: false, message: "Foto dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const id = `GLR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tanggal_upload = new Date().toISOString();
    
    await appendGaleri({
      id,
      judul: judul || "",
      kategori,
      deskripsi: deskripsi || "",
      tanggal_upload,
      url_foto,
    });
    
    revalidateTag("galeri", "max");

    return NextResponse.json({ success: true, message: "Foto berhasil diunggah ke galeri." });
  } catch (error) {
    console.error("Failed to append galeri:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan foto ke database." },
      { status: 500 }
    );
  }
}
