import type { DokumenRow } from "@/types";
import { and, count, desc, asc, eq, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../index";
import { dokumen } from "../schema";

function mapDokumenRow(r: typeof dokumen.$inferSelect): DokumenRow {
  return {
    id: r.id,
    judul: r.judul || "",
    deskripsi: r.deskripsi || "",
    kategori: r.kategori || "",
    url_file: r.url_file,
    tipe_file: r.tipe_file || "",
    resource_type: r.resource_type || "raw",
    tanggal: r.tanggal,
    created_at: r.created_at ?? undefined,
  };
}

export async function getDokumenList(): Promise<DokumenRow[]> {
  "use cache";
  cacheTag("dokumen");

  try {
    const result = await db.select().from(dokumen).orderBy(desc(dokumen.created_at));
    cacheLife("hours");
    return result.map(mapDokumenRow);
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch dokumen:", error);
    return [];
  }
}

export async function getDokumenById(id: string): Promise<DokumenRow | undefined> {
  const result = await db.select().from(dokumen).where(eq(dokumen.id, id));
  if (result.length === 0) return undefined;
  return mapDokumenRow(result[0]);
}

export async function appendDokumen(data: DokumenRow): Promise<void> {
  await db.insert(dokumen).values({
    id: data.id,
    judul: data.judul,
    deskripsi: data.deskripsi,
    kategori: data.kategori,
    url_file: data.url_file,
    tipe_file: data.tipe_file,
    resource_type: data.resource_type,
    tanggal: data.tanggal,
  });
}

export async function updateDokumenById(id: string, updatedData: Partial<DokumenRow>): Promise<boolean> {
  const setData: Partial<typeof dokumen.$inferInsert> = {};

  if (updatedData.judul !== undefined) setData.judul = updatedData.judul;
  if (updatedData.deskripsi !== undefined) setData.deskripsi = updatedData.deskripsi;
  if (updatedData.kategori !== undefined) setData.kategori = updatedData.kategori;
  if (updatedData.url_file !== undefined) setData.url_file = updatedData.url_file;
  if (updatedData.tipe_file !== undefined) setData.tipe_file = updatedData.tipe_file;
  if (updatedData.resource_type !== undefined) setData.resource_type = updatedData.resource_type;

  if (Object.keys(setData).length === 0) return false;
  const result = await db.update(dokumen).set(setData).where(eq(dokumen.id, id));
  return result.rowsAffected > 0;
}

export async function deleteDokumenById(id: string): Promise<boolean> {
  const result = await db.delete(dokumen).where(eq(dokumen.id, id));
  return result.rowsAffected > 0;
}

interface DokumenListingArgs {
  q: string;
  filter: string;
  page: number;
  limit: number;
  sort?: string;
  dir?: string;
}

export async function getDokumenListing(args: DokumenListingArgs) {
  const categoriesResult = await db
    .selectDistinct({ kategori: dokumen.kategori })
    .from(dokumen);

  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, "id")) as string[];

  const conditions = [];

  if (args.q) {
    const searchTerm = `%${args.q}%`;
    conditions.push(
      or(
        like(dokumen.judul, searchTerm),
        like(dokumen.deskripsi, searchTerm),
        like(dokumen.kategori, searchTerm)
      )
    );
  }

  if (args.filter && args.filter !== "all") {
    conditions.push(eq(dokumen.kategori, args.filter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ value: count() })
    .from(dokumen)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / args.limit) || 1;
  const currentPage = Math.max(1, Math.min(args.page, totalPages));

  let sortColumn;
  if (args.sort) {
    switch (args.sort) {
      case "judul": sortColumn = dokumen.judul; break;
      case "tanggal": sortColumn = dokumen.tanggal; break;
      default: sortColumn = dokumen.created_at; break;
    }
  }

  const orderByClause = sortColumn
    ? args.dir === "asc" ? asc(sortColumn) : desc(sortColumn)
    : desc(dokumen.created_at);

  const data = await db
    .select()
    .from(dokumen)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(args.limit)
    .offset((currentPage - 1) * args.limit);

  return {
    items: data.map(mapDokumenRow),
    totalItems,
    totalPages,
    page: currentPage,
    categories,
  };
}
