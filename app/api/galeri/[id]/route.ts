import { NextResponse } from "next/server";
import { deleteGaleriById, getGaleriById, updateGaleriById } from "@/lib/db/queries";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth";

interface GaleriPayload {
  judul?: string;
  kategori?: string;
  deskripsi?: string;
  url_foto?: string;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Galeri tidak valid." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as GaleriPayload;
    const judul = body.judul?.trim() || "";
    const kategori = body.kategori?.trim();
    const deskripsi = body.deskripsi?.trim() || "";
    const url_foto = body.url_foto?.trim();

    if (!kategori || !url_foto) {
      return NextResponse.json(
        { success: false, message: "Kategori dan foto wajib diisi." },
        { status: 400 }
      );
    }

    const oldItem = await getGaleriById(id);

    if (!oldItem) {
      return NextResponse.json(
        { success: false, message: "Data galeri tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await updateGaleriById(id, {
      judul,
      kategori,
      deskripsi,
      url_foto,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Galeri gagal diperbarui di database." },
        { status: 500 }
      );
    }

    revalidateTag("galeri", "max");

    if (oldItem.url_foto && oldItem.url_foto !== url_foto) {
      const deleted = await deleteFromCloudinary(oldItem.url_foto);
      if (!deleted) {
        console.warn("Galeri updated but old Cloudinary image could not be deleted:", oldItem.url_foto);
      }
    }

    return NextResponse.json({ success: true, message: "Galeri berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update galeri:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memperbarui galeri." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    const item = await getGaleriById(id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Data foto tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deleteGaleriById(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus data galeri dari database." },
        { status: 500 }
      );
    }

    revalidateTag("galeri", "max");

    if (item.url_foto && item.url_foto.includes("cloudinary.com")) {
      deleteFromCloudinary(item.url_foto).catch(err => {
        console.error("Failed to cleanup Cloudinary on galeri delete:", err);
      });
    }

    return NextResponse.json({ success: true, message: "Foto galeri berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete galeri:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus foto." },
      { status: 500 }
    );
  }
}
