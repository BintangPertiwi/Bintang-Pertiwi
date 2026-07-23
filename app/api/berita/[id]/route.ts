import { requireRole } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { deleteBeritaById, getBeritaById, updateBeritaById } from "@/lib/db/queries";
import { sanitizeHtml } from "@/lib/sanitize";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import type { BeritaRow } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["super_admin", "kontributor"]);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Berita tidak valid." },
        { status: 400 }
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

    const oldBerita = await getBeritaById(id);

    if (!oldBerita) {
      return NextResponse.json(
        { success: false, message: "Berita tidak ditemukan." },
        { status: 404 }
      );
    }

    if (session.role === "kontributor" && oldBerita.created_by !== session.id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki hak akses untuk mengubah berita ini." },
        { status: 403 }
      );
    }

    const cleanHtml = sanitizeHtml(isi_berita);

    const updatePayload: Partial<BeritaRow> = {
      judul,
      ringkasan,
      isi_berita: cleanHtml,
      kategori,
      url_foto: url_foto !== undefined ? url_foto : undefined,
      media_assets: media_assets !== undefined ? media_assets : undefined,
      status_publikasi: status_publikasi !== undefined ? status_publikasi : undefined,
    };

    const success = await updateBeritaById(id, updatePayload);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Berita gagal diperbarui di database." },
        { status: 500 }
      );
    }

    revalidateTag("berita", "max");

    // Cascading delete for URL Foto and Media Assets
    const oldUrls = new Set<string>();
    if (oldBerita.url_foto && oldBerita.url_foto.includes("cloudinary.com")) {
      oldUrls.add(oldBerita.url_foto);
    }
    if (oldBerita.media_assets) {
      try {
        const assets = JSON.parse(oldBerita.media_assets);
        if (Array.isArray(assets)) {
          assets.forEach((url: string) => {
            if (url && url.includes("cloudinary.com")) oldUrls.add(url);
          });
        }
      } catch (e) { /* ignore */ }
    }
    
    const newUrls = new Set<string>();
    if (url_foto && url_foto.includes("cloudinary.com")) {
      newUrls.add(url_foto);
    }
    if (media_assets) {
      try {
        const assets = JSON.parse(media_assets);
        if (Array.isArray(assets)) {
          assets.forEach((url: string) => {
            if (url && url.includes("cloudinary.com")) newUrls.add(url);
          });
        }
      } catch (e) { /* ignore */ }
    }
    
    const urlsToDelete = Array.from(oldUrls).filter((oldUrl) => !newUrls.has(oldUrl));
    if (urlsToDelete.length > 0) {
      await Promise.allSettled(urlsToDelete.map((url) => deleteFromCloudinary(url)));
    }

    return NextResponse.json({ success: true, message: "Berita berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update berita:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memperbarui berita." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["super_admin", "kontributor"]);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Berita tidak valid." },
        { status: 400 }
      );
    }

    const berita = await getBeritaById(id);

    if (!berita) {
      return NextResponse.json(
        { success: false, message: "Berita tidak ditemukan." },
        { status: 404 }
      );
    }

    if (session.role === "kontributor" && berita.created_by !== session.id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki hak akses untuk menghapus berita ini." },
        { status: 403 }
      );
    }

    const urlsToDelete: string[] = [];
    if (berita.url_foto && berita.url_foto.includes("cloudinary.com")) {
      urlsToDelete.push(berita.url_foto);
    }

    if (berita.media_assets) {
      try {
        const assets: string[] = JSON.parse(berita.media_assets);
        if (Array.isArray(assets)) {
          assets.forEach((url) => {
            if (url && url.includes("cloudinary.com")) {
              urlsToDelete.push(url);
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse media_assets on DELETE", e);
      }
    }

    if (urlsToDelete.length > 0) {
      await Promise.allSettled(urlsToDelete.map((url) => deleteFromCloudinary(url)));
    }

    const success = await deleteBeritaById(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Berita gagal dihapus dari database." },
        { status: 500 }
      );
    }

    // Invalidate cache
    revalidateTag("berita", "max");

    return NextResponse.json({ success: true, message: "Berita dan aset terkait berhasil dihapus." });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat menghapus berita." },
      { status: 500 }
    );
  }
}
