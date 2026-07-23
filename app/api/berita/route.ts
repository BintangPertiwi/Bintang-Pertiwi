import { NextResponse } from "next/server";
import { appendBerita } from "@/lib/db/queries";
import { sanitizeHtml } from "@/lib/sanitize";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await requireRole(["super_admin", "kontributor"]);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { judul, ringkasan, isi_berita, url_foto, kategori, media_assets, status_publikasi } = body;

    if (!judul || !isi_berita || !kategori) {
      return NextResponse.json(
        { success: false, message: "Judul, isi berita, dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    if (isi_berita.length > 45000) {
      return NextResponse.json(
        { success: false, message: "Isi berita terlalu panjang. Pastikan Anda mengunggah gambar menggunakan URL, bukan dengan melakukan copy-paste gambar secara langsung (Base64) ke dalam editor." },
        { status: 400 }
      );
    }

    const id = `BRT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tanggal = new Date().toISOString();
    const cleanHtml = sanitizeHtml(isi_berita);
    await appendBerita({
      id,
      judul,
      tanggal,
      ringkasan: ringkasan || "",
      isi_berita: cleanHtml,
      url_foto: url_foto || "",
      kategori: kategori || "",
      media_assets: media_assets || "",
      status_publikasi: status_publikasi || "Publik",
      created_by: session.id,
    });
    revalidateTag("berita", "max");

    return NextResponse.json({ success: true, message: "Berita berhasil diterbitkan." });
  } catch (error) {
    console.error("Failed to append berita:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan berita ke database." },
      { status: 500 }
    );
  }
}
