import type { BeritaRow } from "@/types";
import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../index";
import { beritaDusun } from "../schema";

function mapBeritaRow(r: typeof beritaDusun.$inferSelect): BeritaRow {
  return {
    id: r.id,
    judul: r.judul,
    tanggal: r.tanggal,
    ringkasan: r.ringkasan || "",
    isi_berita: r.isi_berita,
    url_foto: r.url_foto || "",
    kategori: r.kategori || "",
    media_assets: r.media_assets || "",
    status_publikasi: r.status_publikasi || "Publik",
  };
}


export async function getBeritaList(): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita");

  try {
    const result = await db.select().from(beritaDusun).orderBy(desc(beritaDusun.created_at));
    cacheLife("hours");
    return result.map(mapBeritaRow);
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch berita:", error);
    return [];
  }
}

export async function getBeritaById(id: string): Promise<BeritaRow | undefined> {
  const result = await db.select().from(beritaDusun).where(eq(beritaDusun.id, id));
  if (result.length === 0) return undefined;
  return mapBeritaRow(result[0]);
}

export async function getPublicBeritaById(id: string): Promise<BeritaRow | undefined> {
  "use cache";
  cacheTag("berita", `berita-${id}`);

  try {
    const result = await db.select().from(beritaDusun).where(eq(beritaDusun.id, id));
    cacheLife("hours");
    if (result.length === 0) return undefined;
    return mapBeritaRow(result[0]);
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch berita by id:", error);
    return undefined;
  }
}

export async function getRecentBerita(limit = 3): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita", "berita-recent");

  try {
    const result = await db.select()
      .from(beritaDusun)
      .where(eq(beritaDusun.status_publikasi, "Publik"))
      .orderBy(desc(beritaDusun.created_at))
      .limit(limit);
    cacheLife("hours");
    return result.map(mapBeritaRow);
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch recent berita:", error);
    return [];
  }
}

export async function getTotalBerita(): Promise<number> {
  "use cache";
  cacheTag("berita", "berita-total");

  try {
    const result = await db.select({ value: count() }).from(beritaDusun);
    cacheLife("hours");
    return result[0].value;
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to get total berita:", error);
    return 0;
  }
}

export async function appendBerita(data: BeritaRow): Promise<void> {
  await db.insert(beritaDusun).values({
    id: data.id,
    judul: data.judul,
    tanggal: data.tanggal,
    ringkasan: data.ringkasan || "",
    isi_berita: data.isi_berita,
    url_foto: data.url_foto || "",
    kategori: data.kategori || "",
    media_assets: data.media_assets || "",
    status_publikasi: data.status_publikasi || "Publik",
  });
}

export async function updateBeritaById(id: string, updatedData: Partial<BeritaRow>): Promise<boolean> {
  const setData: Partial<typeof beritaDusun.$inferInsert> = {
    updated_at: new Date().toISOString(),
  };

  if (updatedData.judul !== undefined) setData.judul = updatedData.judul;
  if (updatedData.tanggal !== undefined) setData.tanggal = updatedData.tanggal;
  if (updatedData.ringkasan !== undefined) setData.ringkasan = updatedData.ringkasan;
  if (updatedData.isi_berita !== undefined) setData.isi_berita = updatedData.isi_berita;
  if (updatedData.url_foto !== undefined) setData.url_foto = updatedData.url_foto;
  if (updatedData.kategori !== undefined) setData.kategori = updatedData.kategori;
  if (updatedData.media_assets !== undefined) setData.media_assets = updatedData.media_assets;
  if (updatedData.status_publikasi !== undefined) setData.status_publikasi = updatedData.status_publikasi;

  const result = await db.update(beritaDusun).set(setData).where(eq(beritaDusun.id, id));
  return result.rowsAffected > 0;
}

export async function deleteBeritaById(id: string): Promise<boolean> {
  const result = await db.delete(beritaDusun).where(eq(beritaDusun.id, id));
  return result.rowsAffected > 0;
}

interface BeritaListingArgs {
  q: string;
  filter: string;
  status?: string;
  page: number;
  limit: number;
  sort?: string;
  dir?: string;
}

export async function getBeritaListing(args: BeritaListingArgs) {

  const categoriesResult = await db
    .selectDistinct({ kategori: beritaDusun.kategori })
    .from(beritaDusun);

  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, "id")) as string[];

  const conditions = [];

  if (args.q) {
    const searchTerm = `%${args.q}%`;
    conditions.push(
      or(
        like(beritaDusun.judul, searchTerm),
        like(beritaDusun.ringkasan, searchTerm),
        like(beritaDusun.kategori, searchTerm)
      )
    );
  }

  const isSpecialFilter = args.filter === "all" || args.filter === "with-cover" || args.filter === "without-cover";
  if (isSpecialFilter) {
    if (args.filter === "with-cover") {
      conditions.push(like(beritaDusun.url_foto, "http%"));
    } else if (args.filter === "without-cover") {
      conditions.push(eq(beritaDusun.url_foto, ""));
    }
  } else if (args.filter) {
    conditions.push(eq(beritaDusun.kategori, args.filter));
  }

  const statusFilter = args.status && args.status !== "all" ? args.status : "all";
  if (statusFilter !== "all") {
    conditions.push(eq(beritaDusun.status_publikasi, statusFilter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ value: count() })
    .from(beritaDusun)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / args.limit) || 1;
  const currentPage = Math.max(1, Math.min(args.page, totalPages));

  let sortColumn;
  if (args.sort) {
    switch (args.sort) {
      case "judul": sortColumn = beritaDusun.judul; break;
      case "status_publikasi": sortColumn = beritaDusun.status_publikasi; break;
      case "tanggal": sortColumn = beritaDusun.tanggal; break;
      default: sortColumn = beritaDusun.created_at; break;
    }
  }

  const orderByClause = sortColumn
    ? args.dir === "asc" ? asc(sortColumn) : desc(sortColumn)
    : desc(beritaDusun.created_at);

  const data = await db
    .select()
    .from(beritaDusun)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(args.limit)
    .offset((currentPage - 1) * args.limit);

  return {
    items: data.map(mapBeritaRow),
    totalItems,
    totalPages,
    page: currentPage,
    categories,
  };
}
