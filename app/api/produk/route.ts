import { verifyAdminSession } from "@/lib/auth";
import { appendProduk, isSlugTaken } from "@/lib/db/queries";
import { generateId, slugify } from "@/lib/utils";
import type { ProdukRow, StokStatus } from "@/types";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

async function buildUniqueSlug(nama: string): Promise<string> {
  const base = slugify(nama) || "produk";
  if (!(await isSlugTaken(base))) return base;
  return `${base}-${generateId(4).toLowerCase()}`;
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nama, kategori, harga, harga_coret, stok, deskripsi_singkat, deskripsi_lengkap, informasi_tambahan, sku } = body;
    const gambar_urls = sanitizeStringArray(body.gambar_urls);
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

    const hargaCoretNumber = Number(harga_coret);
    const hargaCoret = Number.isFinite(hargaCoretNumber) && hargaCoretNumber > 0 ? hargaCoretNumber : undefined;

    const id = `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const slug = await buildUniqueSlug(nama);

    const payload: ProdukRow = {
      id,
      slug,
      nama: nama.trim(),
      kategori: kategori.trim(),
      harga: Math.round(hargaNumber),
      harga_coret: hargaCoret !== undefined ? Math.round(hargaCoret) : undefined,
      stok: (stok === "Habis" ? "Habis" : "Tersedia") as StokStatus,
      deskripsi_singkat: (deskripsi_singkat || "").trim(),
      deskripsi_lengkap: (deskripsi_lengkap || "").trim(),
      informasi_tambahan: (informasi_tambahan || "").trim(),
      gambar_urls,
      sku: (sku || "").trim(),
      tags,
    };

    await appendProduk(payload);
    revalidateTag("produk", "max");

    return NextResponse.json({ success: true, message: "Produk berhasil ditambahkan." });
  } catch (error) {
    console.error("Failed to append produk:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan produk ke database." },
      { status: 500 }
    );
  }
}
