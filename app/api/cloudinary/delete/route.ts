import { NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { verifyAdminSession } from "@/lib/auth";
import { isMediaUrlReferenced } from "@/lib/db/queries";

interface DeleteCloudinaryBody {
  secure_url?: string;
  resource_type?: string; // "image" (default) | "raw" (dokumen Office)
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as DeleteCloudinaryBody;
    const secureUrl = body.secure_url?.trim();
    const resourceType = body.resource_type === "raw" ? "raw" : "image";

    if (!secureUrl) {
      return NextResponse.json(
        { success: false, message: "URL gambar tidak valid." },
        { status: 400 }
      );
    }

    // Cegah penghapusan gambar yang masih dipakai konten lain (berita/galeri/hero/
    // produk milik siapa pun). Endpoint ini hanya untuk membersihkan gambar yatim
    // (baru di-upload, belum tersimpan) — penghapusan konten tersimpan harus lewat
    // alur entitasnya masing-masing yang sudah memvalidasi kepemilikan.
    if (await isMediaUrlReferenced(secureUrl)) {
      return NextResponse.json(
        { success: false, message: "Gambar sedang dipakai konten lain dan tidak dapat dihapus dari sini." },
        { status: 403 }
      );
    }

    const deleted = await deleteFromCloudinary(secureUrl, resourceType);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus gambar dari Cloudinary." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Gambar berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete Cloudinary image:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat menghapus gambar." },
      { status: 500 }
    );
  }
}
