import { NextResponse } from "next/server";
import { appendDokumen } from "@/lib/db/queries";
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
    const { judul, kategori, deskripsi, url_file, tipe_file, resource_type } = body;

    if (!url_file || !judul || !kategori) {
      return NextResponse.json(
        { success: false, message: "File, judul, dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const id = `DOK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tanggal = new Date().toISOString();

    await appendDokumen({
      id,
      judul,
      deskripsi: deskripsi || "",
      kategori,
      url_file,
      tipe_file: tipe_file || "",
      resource_type: resource_type === "raw" ? "raw" : "image",
      tanggal,
    });

    revalidateTag("dokumen", "max");

    return NextResponse.json({ success: true, message: "Dokumen berhasil diunggah." });
  } catch (error) {
    console.error("Failed to append dokumen:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan dokumen ke database." },
      { status: 500 }
    );
  }
}
