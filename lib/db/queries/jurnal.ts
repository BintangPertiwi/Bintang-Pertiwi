import type { JurnalRow, ListingQueryParams, PaginatedResult } from "@/types";
import { and, asc, count, desc, eq, like, sql } from "drizzle-orm";
import { db } from "../index";
import { adminAuth, jurnalPenjualan } from "../schema";

export async function getJurnalListing(
  args: ListingQueryParams & { ownerId?: number },
): Promise<PaginatedResult<JurnalRow & { authorName: string }>> {
  const { q = "", filter = "all", page = 1, limit = 10, ownerId } = args;

  const conditions = [];
  
  if (q) {
    conditions.push(like(jurnalPenjualan.nama_item, `%${q}%`));
  }
  
  if (ownerId) {
    conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  }

  const now = new Date();
  if (filter === "bulan_ini") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    conditions.push(sql`${jurnalPenjualan.tanggal} >= ${startOfMonth}`);
  } else if (filter === "tahun_ini") {
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
    conditions.push(sql`${jurnalPenjualan.tanggal} >= ${startOfYear}`);
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalItems }] = await db
    .select({ value: count() })
    .from(jurnalPenjualan)
    .where(whereCondition);

  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));

  let sortColumn;
  if (args.sort) {
    switch (args.sort) {
      case "tanggal": sortColumn = jurnalPenjualan.tanggal; break;
      case "nama_item": sortColumn = jurnalPenjualan.nama_item; break;
      case "total_pendapatan": sortColumn = jurnalPenjualan.total_pendapatan; break;
      default: sortColumn = jurnalPenjualan.created_at; break;
    }
  }

  const orderByClause = sortColumn
    ? args.dir === "asc" ? asc(sortColumn) : desc(sortColumn)
    : desc(jurnalPenjualan.created_at);

  const data = await db
    .select({
      id: jurnalPenjualan.id,
      tanggal: jurnalPenjualan.tanggal,
      nama_item: jurnalPenjualan.nama_item,
      jumlah_terjual: jurnalPenjualan.jumlah_terjual,
      total_pendapatan: jurnalPenjualan.total_pendapatan,
      keterangan: jurnalPenjualan.keterangan,
      created_by: jurnalPenjualan.created_by,
      created_at: jurnalPenjualan.created_at,
      authorName: adminAuth.nama,
    })
    .from(jurnalPenjualan)
    .leftJoin(adminAuth, eq(jurnalPenjualan.created_by, adminAuth.id))
    .where(whereCondition)
    .orderBy(orderByClause)
    .limit(limit)
    .offset((currentPage - 1) * limit);

  return {
    items: data.map(({ authorName, created_at, keterangan, ...rest }) => ({ 
      ...rest, 
      keterangan: keterangan || "",
      created_at: created_at || undefined,
      authorName: authorName || "Unknown" 
    })),
    totalItems,
    totalPages,
    page: currentPage,
    limit,
    startIndex: (currentPage - 1) * limit,
    endIndex: Math.min(currentPage * limit, totalItems),
  };
}

export async function getJurnalById(id: string): Promise<JurnalRow | null> {
  const result = await db
    .select()
    .from(jurnalPenjualan)
    .where(eq(jurnalPenjualan.id, id))
    .limit(1);

  if (result.length === 0) return null;
  const { created_at, updated_at, keterangan, ...rest } = result[0];
  return {
    ...rest,
    keterangan: keterangan || "",
    created_at: created_at || undefined,
  };
}

export async function appendJurnal(
  data: Omit<JurnalRow, "id" | "created_at" | "updated_at">
): Promise<void> {
  const id = crypto.randomUUID();
  await db.insert(jurnalPenjualan).values({
    ...data,
    id,
  });
}

export async function updateJurnal(
  id: string,
  data: Partial<Omit<JurnalRow, "id" | "created_at" | "updated_at">>
): Promise<void> {
  await db
    .update(jurnalPenjualan)
    .set({
      ...data,
      updated_at: sql`(datetime('now'))`,
    })
    .where(eq(jurnalPenjualan.id, id));
}

export async function deleteJurnalById(id: string): Promise<boolean> {
  const result = await db.delete(jurnalPenjualan).where(eq(jurnalPenjualan.id, id)).returning();
  return result.length > 0;
}

export async function getJurnalChartData(ownerId?: number) {
  const conditions = [];
  if (ownerId) {
    conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  }
  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
  
  // Aggregate revenue by item name
  const result = await db
    .select({
      name: jurnalPenjualan.nama_item,
      value: sql<number>`SUM(${jurnalPenjualan.total_pendapatan})`,
    })
    .from(jurnalPenjualan)
    .where(whereCondition)
    .groupBy(jurnalPenjualan.nama_item)
    .orderBy(desc(sql`SUM(${jurnalPenjualan.total_pendapatan})`))
    .limit(10);
    
  return result.map(r => ({
    name: r.name,
    value: Number(r.value || 0),
  }));
}
