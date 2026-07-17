import { verifyAdminSession } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { deleteProdukById, getProdukById, isSlugTaken, updateProdukById } from "@/lib/db/queries";
import { generateId, slugify } from "@/lib/utils";
import type { ProdukRow, StokStatus } from "@/types";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function collectCloudinaryUrls(urls: string[]): Set<string> {
  const set = new Set<string>();
  urls.forEach((url) => {
    if (url && url.includes("cloudinary.com")) set.add(url);
  });
  return set;
}

async function buildUniqueSlug(nama: string, exceptId: string): Promise<string> {
  const base = slugify(nama) || "produk";
  if (!(await isSlugTaken(base, exceptId))) return base;
  return `${base}-${generateId(4).toLowerCase()}`;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Produk tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nama, kategori, harga, harga_coret, satuan, stok, deskripsi_singkat, deskripsi_lengkap, informasi_tambahan, sku, nomor_wa } = body;
    const gambar_urls = sanitizeStringArray(body.gambar_urls);
    const varian = sanitizeStringArray(body.varian);
    const tags = sanitizeStringArray(body.tags);

    if (!nama || typeof nama !== "string" || !kategori || typeof kategori !== "string") {
      return NextResponse.json(
        { success: false, message: "Nama dan kategori produk wajib diisi." },
        { status: 400 }
      );
    }

    const hargaNumber = Number(harga);
    if (!Number.isFinite(hargaNumber) || hargaNumber < 0) {
      return NextResponse.json(
        { success: false, message: "Harga produk tidak valid." },
        { status: 400 }
      );
    }

    if (gambar_urls.length === 0) {
      return NextResponse.json(
        { success: false, message: "Minimal satu gambar produk wajib diunggah." },
        { status: 400 }
      );
    }

    const oldProduk = await getProdukById(id);
    if (!oldProduk) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    // Kontributor hanya boleh mengubah produk miliknya sendiri.
    if (session.role !== "super_admin" && oldProduk.created_by !== session.id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak berhak mengubah produk ini." },
        { status: 403 }
      );
    }

    const hargaCoretNumber = Number(harga_coret);
    const hargaCoret = Number.isFinite(hargaCoretNumber) && hargaCoretNumber > 0 ? Math.round(hargaCoretNumber) : undefined;

    const slug = nama.trim() !== oldProduk.nama ? await buildUniqueSlug(nama, id) : oldProduk.slug;

    const updatePayload: Partial<ProdukRow> = {
      slug,
      nama: nama.trim(),
      kategori: kategori.trim(),
      harga: Math.round(hargaNumber),
      harga_coret: hargaCoret,
      satuan: (satuan || "").trim(),
      stok: (stok === "Habis" ? "Habis" : "Tersedia") as StokStatus,
      deskripsi_singkat: (deskripsi_singkat || "").trim(),
      deskripsi_lengkap: (deskripsi_lengkap || "").trim(),
      informasi_tambahan: (informasi_tambahan || "").trim(),
      gambar_urls,
      sku: (sku || "").trim(),
      varian,
      tags,
      nomor_wa: (nomor_wa || "").trim(),
    };

    const success = await updateProdukById(id, updatePayload);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Produk gagal diperbarui di database." },
        { status: 500 }
      );
    }

    revalidateTag("produk", "max");

    const oldUrls = collectCloudinaryUrls(oldProduk.gambar_urls);
    const newUrls = collectCloudinaryUrls(gambar_urls);
    const urlsToDelete = Array.from(oldUrls).filter((oldUrl) => !newUrls.has(oldUrl));
    if (urlsToDelete.length > 0) {
      await Promise.allSettled(urlsToDelete.map((url) => deleteFromCloudinary(url)));
    }

    return NextResponse.json({ success: true, message: "Produk berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update produk:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memperbarui produk." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Produk tidak valid." },
        { status: 400 }
      );
    }

    const produk = await getProdukById(id);
    if (!produk) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    // Kontributor hanya boleh menghapus produk miliknya sendiri.
    if (session.role !== "super_admin" && produk.created_by !== session.id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak berhak menghapus produk ini." },
        { status: 403 }
      );
    }

    const urlsToDelete = Array.from(collectCloudinaryUrls(produk.gambar_urls));
    if (urlsToDelete.length > 0) {
      await Promise.allSettled(urlsToDelete.map((url) => deleteFromCloudinary(url)));
    }

    const success = await deleteProdukById(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Produk gagal dihapus dari database." },
        { status: 500 }
      );
    }

    revalidateTag("produk", "max");

    return NextResponse.json({ success: true, message: "Produk dan aset terkait berhasil dihapus." });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat menghapus produk." },
      { status: 500 }
    );
  }
}
