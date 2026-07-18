import { NextResponse } from "next/server";
import { deleteDokumenById, getDokumenById, updateDokumenById } from "@/lib/db/queries";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth";

interface DokumenPayload {
  judul?: string;
  kategori?: string;
  deskripsi?: string;
  url_file?: string;
  tipe_file?: string;
  resource_type?: string;
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
        { success: false, message: "ID Dokumen tidak valid." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as DokumenPayload;
    const judul = body.judul?.trim() || "";
    const kategori = body.kategori?.trim();
    const deskripsi = body.deskripsi?.trim() || "";
    const url_file = body.url_file?.trim();
    const tipe_file = body.tipe_file?.trim() || "";
    const resource_type = body.resource_type === "raw" ? "raw" : "image";

    if (!judul || !kategori || !url_file) {
      return NextResponse.json(
        { success: false, message: "Judul, kategori, dan file wajib diisi." },
        { status: 400 }
      );
    }

    const oldItem = await getDokumenById(id);
    if (!oldItem) {
      return NextResponse.json(
        { success: false, message: "Data dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await updateDokumenById(id, {
      judul,
      kategori,
      deskripsi,
      url_file,
      tipe_file,
      resource_type,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Dokumen gagal diperbarui di database." },
        { status: 500 }
      );
    }

    revalidateTag("dokumen", "max");

    // Hapus file lama dari Cloudinary bila file diganti (pakai resource_type lama).
    if (oldItem.url_file && oldItem.url_file !== url_file) {
      const deleted = await deleteFromCloudinary(oldItem.url_file, oldItem.resource_type);
      if (!deleted) {
        console.warn("Dokumen updated but old Cloudinary file could not be deleted:", oldItem.url_file);
      }
    }

    return NextResponse.json({ success: true, message: "Dokumen berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update dokumen:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memperbarui dokumen." },
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

    const item = await getDokumenById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Data dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deleteDokumenById(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus data dokumen dari database." },
        { status: 500 }
      );
    }

    revalidateTag("dokumen", "max");

    if (item.url_file && item.url_file.includes("cloudinary.com")) {
      deleteFromCloudinary(item.url_file, item.resource_type).catch((err) => {
        console.error("Failed to cleanup Cloudinary on dokumen delete:", err);
      });
    }

    return NextResponse.json({ success: true, message: "Dokumen berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete dokumen:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus dokumen." },
      { status: 500 }
    );
  }
}
