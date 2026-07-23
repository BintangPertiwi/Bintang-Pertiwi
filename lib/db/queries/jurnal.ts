import type { JurnalRow, ListingQueryParams, PaginatedResult } from "@/types";
import { and, asc, count, desc, eq, like, sql } from "drizzle-orm";
import { db } from "../index";
import { adminAuth, jurnalPenjualan } from "../schema";

export async function getJurnalListing(
  args: ListingQueryParams & { ownerId?: number },
): Promise<PaginatedResult<JurnalRow & { authorName: string }>> {
  const { q = "", month, year, product, page = 1, limit = 10, ownerId } = args;

  const conditions = [];
  
  if (q) {
    conditions.push(like(jurnalPenjualan.nama_item, `%${q}%`));
  }
  
  if (ownerId) {
    conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  }

  if (year && year !== "all") {
    conditions.push(like(jurnalPenjualan.tanggal, `${year}-%`));
  }
  
  if (month && month !== "all") {
    if (year && year !== "all") {
      conditions.push(like(jurnalPenjualan.tanggal, `${year}-${month}-%`));
    } else {
      conditions.push(like(jurnalPenjualan.tanggal, `%-${month}-%`));
    }
  }

  if (product && product !== "all") {
    conditions.push(eq(jurnalPenjualan.nama_item, product));
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
      authorUsername: adminAuth.username,
    })
    .from(jurnalPenjualan)
    .leftJoin(adminAuth, eq(jurnalPenjualan.created_by, adminAuth.id))
    .where(whereCondition)
    .orderBy(orderByClause)
    .limit(limit)
    .offset((currentPage - 1) * limit);

  return {
    items: data.map(({ authorName, authorUsername, created_at, keterangan, ...rest }) => ({ 
      ...rest, 
      keterangan: keterangan || "",
      created_at: created_at || undefined,
      authorName: authorName?.trim() || authorUsername || "-" 
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

export async function getJurnalFilterOptions(ownerId?: number) {
  const conditions = [];
  if (ownerId) conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const productsResult = await db
    .select({ name: jurnalPenjualan.nama_item })
    .from(jurnalPenjualan)
    .where(whereCondition)
    .groupBy(jurnalPenjualan.nama_item)
    .orderBy(jurnalPenjualan.nama_item);

  const yearsResult = await db
    .select({ year: sql<string>`strftime('%Y', ${jurnalPenjualan.tanggal})` })
    .from(jurnalPenjualan)
    .where(whereCondition)
    .groupBy(sql`strftime('%Y', ${jurnalPenjualan.tanggal})`)
    .orderBy(desc(sql`strftime('%Y', ${jurnalPenjualan.tanggal})`));

  const currentYear = new Date().getFullYear();
  let years = yearsResult.map(r => r.year).filter(Boolean);
  
  if (years.length === 0) {
    years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  } else {
    if (!years.includes(String(currentYear))) {
      years.unshift(String(currentYear));
      years.sort((a, b) => Number(b) - Number(a));
    }
  }

  return {
    products: productsResult.map(r => r.name).filter(Boolean),
    years,
  };
}

export async function getJurnalChartData(args: { ownerId?: number; month?: string; year?: string; product?: string }) {
  const { ownerId, month, year, product } = args;
  const conditions = [];
  if (ownerId) conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  
  if (year && year !== "all") {
    conditions.push(like(jurnalPenjualan.tanggal, `${year}-%`));
  }
  if (month && month !== "all") {
    if (year && year !== "all") {
      conditions.push(like(jurnalPenjualan.tanggal, `${year}-${month}-%`));
    } else {
      conditions.push(like(jurnalPenjualan.tanggal, `%-${month}-%`));
    }
  }
  if (product && product !== "all") {
    conditions.push(eq(jurnalPenjualan.nama_item, product));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
  
  const pieResult = await db
    .select({
      name: jurnalPenjualan.nama_item,
      value: sql<number>`SUM(${jurnalPenjualan.total_pendapatan})`,
    })
    .from(jurnalPenjualan)
    .where(whereCondition)
    .groupBy(jurnalPenjualan.nama_item)
    .orderBy(desc(sql`SUM(${jurnalPenjualan.total_pendapatan})`))
    .limit(10);
    
  let timeFormat = '%Y-%m';
  if (month && month !== "all") {
    timeFormat = '%Y-%m-%d';
  }
  
  const lineResult = await db
    .select({
      time: sql<string>`strftime(${timeFormat}, ${jurnalPenjualan.tanggal})`,
      value: sql<number>`SUM(${jurnalPenjualan.total_pendapatan})`,
    })
    .from(jurnalPenjualan)
    .where(whereCondition)
    .groupBy(sql`strftime(${timeFormat}, ${jurnalPenjualan.tanggal})`)
    .orderBy(asc(sql`strftime(${timeFormat}, ${jurnalPenjualan.tanggal})`))
    .limit(30);

  return {
    pieData: pieResult.map(r => ({ name: r.name, value: Number(r.value || 0) })),
    lineData: lineResult.map(r => ({ name: r.time, value: Number(r.value || 0) }))
  };
}

export interface JurnalStats {
  totalPendapatan: number;
  totalProduk: number;
  totalQty: number;
}

export async function getJurnalStats(ownerId?: number): Promise<JurnalStats> {
  const conditions = [];
  if (ownerId) conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const [agg] = await db
    .select({
      totalPendapatan: sql<number>`COALESCE(SUM(${jurnalPenjualan.total_pendapatan}), 0)`,
      totalProduk: sql<number>`COUNT(DISTINCT ${jurnalPenjualan.nama_item})`,
      totalQty: sql<number>`COALESCE(SUM(${jurnalPenjualan.jumlah_terjual}), 0)`,
    })
    .from(jurnalPenjualan)
    .where(whereCondition);

  return {
    totalPendapatan: Number(agg.totalPendapatan),
    totalProduk: Number(agg.totalProduk),
    totalQty: Number(agg.totalQty),
  };
}
