import type { GaleriRow } from "@/types";
import { and, count, desc, asc, eq, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../index";
import { galeriDusun } from "../schema";

function mapGaleriRow(r: typeof galeriDusun.$inferSelect): GaleriRow {
  return {
    id: r.id,
    judul: r.judul || "",
    kategori: r.kategori,
    deskripsi: r.deskripsi || "",
    tanggal_upload: r.tanggal_upload,
    url_foto: r.url_foto,
  };
}

// Pola caching: hasil sukses di-cache "hours", fallback saat Turso error di-cache
// "minutes" (conditional cacheLife) agar tidak ter-poison lama & self-heal cepat.
// "minutes" bukan "seconds": profil "seconds" dianggap dinamis saat prerender.

export async function getGaleriList(): Promise<GaleriRow[]> {
  "use cache";
  cacheTag("galeri");

  try {
    const result = await db.select().from(galeriDusun).orderBy(desc(galeriDusun.created_at));
    cacheLife("hours");
    return result.map(mapGaleriRow);
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch galeri:", error);
    return [];
  }
}

export async function getGaleriById(id: string): Promise<GaleriRow | undefined> {
  const result = await db.select().from(galeriDusun).where(eq(galeriDusun.id, id));
  if (result.length === 0) return undefined;
  return mapGaleriRow(result[0]);
}

export async function getTotalGaleri(): Promise<number> {
  "use cache";
  cacheTag("galeri", "galeri-total");

  try {
    const result = await db.select({ value: count() }).from(galeriDusun);
    cacheLife("hours");
    return result[0].value;
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to get total galeri:", error);
    return 0;
  }
}

export async function appendGaleri(data: GaleriRow): Promise<void> {
  await db.insert(galeriDusun).values({
    id: data.id,
    judul: data.judul,
    kategori: data.kategori,
    deskripsi: data.deskripsi,
    tanggal_upload: data.tanggal_upload,
    url_foto: data.url_foto,
  });
}

export async function updateGaleriById(id: string, updatedData: Partial<GaleriRow>): Promise<boolean> {
  const setData: Partial<typeof galeriDusun.$inferInsert> = {};

  if (updatedData.judul !== undefined) setData.judul = updatedData.judul;
  if (updatedData.kategori !== undefined) setData.kategori = updatedData.kategori;
  if (updatedData.deskripsi !== undefined) setData.deskripsi = updatedData.deskripsi;
  if (updatedData.url_foto !== undefined) setData.url_foto = updatedData.url_foto;

  if (Object.keys(setData).length === 0) return false;
  const result = await db.update(galeriDusun).set(setData).where(eq(galeriDusun.id, id));
  return result.rowsAffected > 0;
}

export async function deleteGaleriById(id: string): Promise<boolean> {
  const result = await db.delete(galeriDusun).where(eq(galeriDusun.id, id));
  return result.rowsAffected > 0;
}

interface GaleriListingArgs {
  q: string;
  filter: string;
  page: number;
  limit: number;
  sort?: string;
  dir?: string;
}

export async function getGaleriListing(args: GaleriListingArgs) {
  const categoriesResult = await db
    .selectDistinct({ kategori: galeriDusun.kategori })
    .from(galeriDusun);
  
  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, "id")) as string[];

  const conditions = [];

  if (args.q) {
    const searchTerm = `%${args.q}%`;
    conditions.push(
      or(
        like(galeriDusun.judul, searchTerm),
        like(galeriDusun.deskripsi, searchTerm),
        like(galeriDusun.kategori, searchTerm)
      )
    );
  }

  if (args.filter && args.filter !== "all") {
    conditions.push(eq(galeriDusun.kategori, args.filter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ value: count() })
    .from(galeriDusun)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / args.limit) || 1;
  const currentPage = Math.max(1, Math.min(args.page, totalPages));

  let sortColumn;
  if (args.sort) {
    switch (args.sort) {
      case "kategori": sortColumn = galeriDusun.kategori; break;
      case "judul": sortColumn = galeriDusun.judul; break;
      case "tanggal_upload": sortColumn = galeriDusun.tanggal_upload; break;
      default: sortColumn = galeriDusun.created_at; break;
    }
  }

  const orderByClause = sortColumn
    ? args.dir === "asc" ? asc(sortColumn) : desc(sortColumn)
    : desc(galeriDusun.created_at);

  const data = await db
    .select()
    .from(galeriDusun)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(args.limit)
    .offset((currentPage - 1) * args.limit);

  return {
    items: data.map(mapGaleriRow),
    totalItems,
    totalPages,
    page: currentPage,
    categories,
  };
}
