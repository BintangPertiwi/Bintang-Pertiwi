import type { ProdukRow, StokStatus } from "@/types";
import { and, count, desc, asc, eq, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../index";
import { adminAuth, produkUmkm } from "../schema";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function mapProdukRow(r: typeof produkUmkm.$inferSelect): ProdukRow {
  return {
    id: r.id,
    slug: r.slug,
    nama: r.nama,
    kategori: r.kategori || "",
    harga: r.harga,
    harga_coret: r.harga_coret ?? undefined,
    satuan: r.satuan || "",
    stok: (r.stok as StokStatus) || "Tersedia",
    deskripsi_singkat: r.deskripsi_singkat || "",
    deskripsi_lengkap: r.deskripsi_lengkap || "",
    informasi_tambahan: r.informasi_tambahan || "",
    gambar_urls: parseJsonArray(r.gambar_urls),
    sku: r.sku || "",
    varian: parseJsonArray(r.varian),
    tags: parseJsonArray(r.tags),
    created_by: r.created_by ?? undefined,
    nomor_wa: r.nomor_wa || "",
    created_at: r.created_at ?? undefined,
  };
}

export async function getProdukList(): Promise<ProdukRow[]> {
  "use cache";
  cacheTag("produk");

  try {
    const result = await db.select().from(produkUmkm).orderBy(desc(produkUmkm.created_at));
    cacheLife("hours");
    return result.map(mapProdukRow);
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch produk:", error);
    return [];
  }
}

export async function getProdukBySlug(slug: string): Promise<ProdukRow | undefined> {
  "use cache";
  cacheTag("produk", `produk-${slug}`);

  try {
    const result = await db
      .select()
      .from(produkUmkm)
      .leftJoin(adminAuth, eq(produkUmkm.created_by, adminAuth.id))
      .where(eq(produkUmkm.slug, slug));
    cacheLife("hours");
    if (result.length === 0) return undefined;
    const produk = mapProdukRow(result[0].produk_umkm);
    produk.owner_wa = produk.nomor_wa || result[0].admin_auth?.wa_number || "";
    return produk;
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch produk by slug:", error);
    return undefined;
  }
}

export async function getProdukById(id: string): Promise<ProdukRow | undefined> {
  const result = await db.select().from(produkUmkm).where(eq(produkUmkm.id, id));
  if (result.length === 0) return undefined;
  return mapProdukRow(result[0]);
}

export async function isSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const result = await db.select({ id: produkUmkm.id }).from(produkUmkm).where(eq(produkUmkm.slug, slug));
  return result.some((row) => row.id !== exceptId);
}

export async function appendProduk(data: ProdukRow): Promise<void> {
  await db.insert(produkUmkm).values({
    id: data.id,
    slug: data.slug,
    nama: data.nama,
    kategori: data.kategori,
    harga: data.harga,
    harga_coret: data.harga_coret ?? null,
    satuan: data.satuan,
    stok: data.stok,
    deskripsi_singkat: data.deskripsi_singkat,
    deskripsi_lengkap: data.deskripsi_lengkap,
    informasi_tambahan: data.informasi_tambahan,
    gambar_urls: JSON.stringify(data.gambar_urls),
    sku: data.sku,
    varian: JSON.stringify(data.varian),
    tags: JSON.stringify(data.tags),
    created_by: data.created_by ?? null,
    nomor_wa: data.nomor_wa || "",
  });
}

export async function updateProdukById(id: string, updatedData: Partial<ProdukRow>): Promise<boolean> {
  const setData: Partial<typeof produkUmkm.$inferInsert> = {};

  if (updatedData.slug !== undefined) setData.slug = updatedData.slug;
  if (updatedData.nama !== undefined) setData.nama = updatedData.nama;
  if (updatedData.kategori !== undefined) setData.kategori = updatedData.kategori;
  if (updatedData.harga !== undefined) setData.harga = updatedData.harga;
  if ("harga_coret" in updatedData) setData.harga_coret = updatedData.harga_coret ?? null;
  if (updatedData.satuan !== undefined) setData.satuan = updatedData.satuan;
  if (updatedData.stok !== undefined) setData.stok = updatedData.stok;
  if (updatedData.deskripsi_singkat !== undefined) setData.deskripsi_singkat = updatedData.deskripsi_singkat;
  if (updatedData.deskripsi_lengkap !== undefined) setData.deskripsi_lengkap = updatedData.deskripsi_lengkap;
  if (updatedData.informasi_tambahan !== undefined) setData.informasi_tambahan = updatedData.informasi_tambahan;
  if (updatedData.gambar_urls !== undefined) setData.gambar_urls = JSON.stringify(updatedData.gambar_urls);
  if (updatedData.sku !== undefined) setData.sku = updatedData.sku;
  if (updatedData.varian !== undefined) setData.varian = JSON.stringify(updatedData.varian);
  if (updatedData.tags !== undefined) setData.tags = JSON.stringify(updatedData.tags);
  if (updatedData.nomor_wa !== undefined) setData.nomor_wa = updatedData.nomor_wa;

  if (Object.keys(setData).length === 0) return false;
  setData.updated_at = new Date().toISOString();

  const result = await db.update(produkUmkm).set(setData).where(eq(produkUmkm.id, id));
  return result.rowsAffected > 0;
}

export async function deleteProdukById(id: string): Promise<boolean> {
  const result = await db.delete(produkUmkm).where(eq(produkUmkm.id, id));
  return result.rowsAffected > 0;
}

interface ProdukListingArgs {
  q: string;
  filter: string;
  page: number;
  limit: number;
  ownerId?: number;
  sort?: string;
  dir?: string;
}

export async function getProdukListing(args: ProdukListingArgs) {
  const categoriesResult = await db
    .selectDistinct({ kategori: produkUmkm.kategori })
    .from(produkUmkm);

  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, "id")) as string[];

  const conditions = [];

  if (args.q) {
    const searchTerm = `%${args.q}%`;
    conditions.push(
      or(
        like(produkUmkm.nama, searchTerm),
        like(produkUmkm.deskripsi_singkat, searchTerm),
        like(produkUmkm.kategori, searchTerm),
        like(produkUmkm.sku, searchTerm)
      )
    );
  }

  if (args.filter && args.filter !== "all") {
    conditions.push(eq(produkUmkm.kategori, args.filter));
  }

  // Kontributor hanya melihat produk miliknya.
  if (args.ownerId !== undefined) {
    conditions.push(eq(produkUmkm.created_by, args.ownerId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ value: count() })
    .from(produkUmkm)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / args.limit) || 1;
  const currentPage = Math.max(1, Math.min(args.page, totalPages));

  let sortColumn;
  if (args.sort) {
    switch (args.sort) {
      case "nama": sortColumn = produkUmkm.nama; break;
      case "harga": sortColumn = produkUmkm.harga; break;
      case "stok": sortColumn = produkUmkm.stok; break;
      default: sortColumn = produkUmkm.created_at; break;
    }
  }

  const orderByClause = sortColumn
    ? args.dir === "asc" ? asc(sortColumn) : desc(sortColumn)
    : desc(produkUmkm.created_at);

  const data = await db
    .select()
    .from(produkUmkm)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(args.limit)
    .offset((currentPage - 1) * args.limit);

  return {
    items: data.map(mapProdukRow),
    totalItems,
    totalPages,
    page: currentPage,
    categories,
  };
}

export async function getProdukNamesByOwner(ownerId?: number): Promise<string[]> {
  const conditions = [];
  if (ownerId !== undefined) {
    conditions.push(eq(produkUmkm.created_by, ownerId));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .selectDistinct({ nama: produkUmkm.nama })
    .from(produkUmkm)
    .where(whereClause)
    .orderBy(asc(produkUmkm.nama));

  return result.map((r) => r.nama).filter(Boolean);
}
