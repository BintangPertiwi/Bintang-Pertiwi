import type { JurnalItemRow, JurnalRow, ListingQueryParams, PaginatedResult } from "@/types";
import { and, asc, count, desc, eq, exists, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { db } from "../index";
import { adminAuth, jurnalItems, jurnalPenjualan } from "../schema";

export async function getJurnalListing(
  args: ListingQueryParams & { ownerId?: number },
): Promise<PaginatedResult<JurnalRow & { authorName: string }>> {
  const { q = "", month, year, product, page = 1, limit = 10, ownerId, dateFrom, dateTo } = args;

  const conditions = [];
  
  if (q) {
    conditions.push(or(
      like(jurnalPenjualan.nama_item, `%${q}%`),
      exists(db.select().from(jurnalItems).where(and(eq(jurnalItems.jurnal_id, jurnalPenjualan.id), like(jurnalItems.nama_item, `%${q}%`))))
    ));
  }
  
  if (ownerId) {
    conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  }

  if (dateFrom && dateTo) {
    conditions.push(gte(jurnalPenjualan.tanggal, dateFrom));
    conditions.push(lte(jurnalPenjualan.tanggal, dateTo));
  } else {
    if (year && year !== "all") {
      if (month && month !== "all") {
        conditions.push(like(jurnalPenjualan.tanggal, `${year}-${month}-%`));
      } else {
        conditions.push(like(jurnalPenjualan.tanggal, `${year}-%`));
      }
    } else if (month && month !== "all") {
      conditions.push(like(jurnalPenjualan.tanggal, `%-${month}-%`));
    }
  }

  if (product && product !== "all") {
    conditions.push(or(
      eq(jurnalPenjualan.nama_item, product),
      exists(db.select().from(jurnalItems).where(and(eq(jurnalItems.jurnal_id, jurnalPenjualan.id), eq(jurnalItems.nama_item, product))))
    ));
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
      url_nota: jurnalPenjualan.url_nota,
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

  const ids = data.map(r => r.id);
  const allItems: JurnalItemRow[] = ids.length > 0
    ? await db.select().from(jurnalItems).where(inArray(jurnalItems.jurnal_id, ids))
    : [];

  return {
    items: data.map(({ authorName, authorUsername, created_at, keterangan, url_nota, ...rest }) => ({ 
      ...rest, 
      keterangan: keterangan || "",
      url_nota: url_nota || undefined,
      created_at: created_at || undefined,
      authorName: authorName?.trim() || authorUsername || "-",
      items: allItems.filter(i => i.jurnal_id === rest.id)
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
  const { created_at, updated_at, keterangan, url_nota, ...rest } = result[0];
  
  const items = await db.select().from(jurnalItems).where(eq(jurnalItems.jurnal_id, id));
  
  return {
    ...rest,
    keterangan: keterangan || "",
    url_nota: url_nota || "",
    created_at: created_at || undefined,
    items,
  };
}

export async function appendJurnal(
  data: Omit<JurnalRow, "id" | "created_at" | "updated_at">
): Promise<void> {
  const { items, ...headerData } = data;
  const id = crypto.randomUUID();
  
  await db.transaction(async (tx) => {
    await tx.insert(jurnalPenjualan).values({
      ...headerData,
      id,
    });
    
    if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        jurnal_id: id,
      }));
      await tx.insert(jurnalItems).values(itemsToInsert);
    }
  });
}

export async function updateJurnal(
  id: string,
  data: Partial<Omit<JurnalRow, "id" | "created_at" | "updated_at">>
): Promise<void> {
  const { items, ...headerData } = data;
  
  await db.transaction(async (tx) => {
    if (Object.keys(headerData).length > 0) {
      await tx
        .update(jurnalPenjualan)
        .set({
          ...headerData,
          updated_at: sql`(datetime('now'))`,
        })
        .where(eq(jurnalPenjualan.id, id));
    }
      
    if (items !== undefined) {
      await tx.delete(jurnalItems).where(eq(jurnalItems.jurnal_id, id));
      
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          ...item,
          id: crypto.randomUUID(),
          jurnal_id: id,
        }));
        await tx.insert(jurnalItems).values(itemsToInsert);
      }
    }
  });
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
    .selectDistinct({ name: sql<string>`COALESCE(${jurnalItems.nama_item}, ${jurnalPenjualan.nama_item})` })
    .from(jurnalPenjualan)
    .leftJoin(jurnalItems, eq(jurnalPenjualan.id, jurnalItems.jurnal_id))
    .where(whereCondition)
    .orderBy(sql`COALESCE(${jurnalItems.nama_item}, ${jurnalPenjualan.nama_item})`);

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
    conditions.push(or(
      eq(jurnalPenjualan.nama_item, product),
      exists(db.select().from(jurnalItems).where(and(eq(jurnalItems.jurnal_id, jurnalPenjualan.id), eq(jurnalItems.nama_item, product))))
    ));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;
  
  const pieResult = await db
    .select({
      name: sql<string>`COALESCE(${jurnalItems.nama_item}, ${jurnalPenjualan.nama_item})`,
      value: sql<number>`SUM(COALESCE(${jurnalItems.subtotal}, ${jurnalPenjualan.total_pendapatan}))`,
    })
    .from(jurnalPenjualan)
    .leftJoin(jurnalItems, eq(jurnalPenjualan.id, jurnalItems.jurnal_id))
    .where(whereCondition)
    .groupBy(sql`COALESCE(${jurnalItems.nama_item}, ${jurnalPenjualan.nama_item})`)
    .orderBy(desc(sql`SUM(COALESCE(${jurnalItems.subtotal}, ${jurnalPenjualan.total_pendapatan}))`))
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

export async function getJurnalExportData(
  args: ListingQueryParams & { ownerId?: number },
): Promise<{
  items: (JurnalRow & { authorName: string })[];
  stats: { totalPendapatan: number; totalProduk: number; totalQty: number; totalTransaksi: number };
}> {
  const { q = "", month, year, product, dateFrom, dateTo, ownerId } = args;

  const conditions = [];

  if (ownerId) {
    conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  }

  if (q) {
    conditions.push(or(
      like(jurnalPenjualan.nama_item, `%${q}%`),
      exists(db.select().from(jurnalItems).where(and(eq(jurnalItems.jurnal_id, jurnalPenjualan.id), like(jurnalItems.nama_item, `%${q}%`))))
    ));
  }

  // If dateRange is used, it overrides month/year
  if (dateFrom && dateTo) {
    conditions.push(gte(jurnalPenjualan.tanggal, dateFrom));
    conditions.push(lte(jurnalPenjualan.tanggal, dateTo));
  } else {
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
  }

  if (product && product !== "all") {
    conditions.push(or(
      eq(jurnalPenjualan.nama_item, product),
      exists(db.select().from(jurnalItems).where(and(eq(jurnalItems.jurnal_id, jurnalPenjualan.id), eq(jurnalItems.nama_item, product))))
    ));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select({
      id: jurnalPenjualan.id,
      tanggal: jurnalPenjualan.tanggal,
      nama_item: jurnalPenjualan.nama_item,
      jumlah_terjual: jurnalPenjualan.jumlah_terjual,
      total_pendapatan: jurnalPenjualan.total_pendapatan,
      keterangan: jurnalPenjualan.keterangan,
      url_nota: jurnalPenjualan.url_nota,
      created_by: jurnalPenjualan.created_by,
      created_at: jurnalPenjualan.created_at,
      authorName: adminAuth.nama,
    })
    .from(jurnalPenjualan)
    .leftJoin(adminAuth, eq(jurnalPenjualan.created_by, adminAuth.id))
    .where(whereCondition)
    .orderBy(desc(jurnalPenjualan.tanggal), desc(jurnalPenjualan.created_at))
    .limit(5000);

  const ids = data.map(r => r.id);
  const allItems: JurnalItemRow[] = [];
  if (ids.length > 0) {
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      const items = await db.select().from(jurnalItems).where(inArray(jurnalItems.jurnal_id, chunk));
      allItems.push(...items);
    }
  }

  let totalPendapatan = 0;
  let totalQty = 0;
  const uniqueProducts = new Set<string>();

  const mappedItems = data.map(item => {
    totalPendapatan += item.total_pendapatan;
    totalQty += item.jumlah_terjual;
    
    const childItems = allItems.filter(i => i.jurnal_id === item.id);
    if (childItems.length > 0) {
      childItems.forEach(i => uniqueProducts.add(i.nama_item));
    } else {
      uniqueProducts.add(item.nama_item);
    }

    return {
      ...item,
      keterangan: item.keterangan || "",
      url_nota: item.url_nota || "",
      authorName: item.authorName || "-",
      created_at: item.created_at || undefined,
      items: childItems,
    };
  });

  return {
    items: mappedItems,
    stats: {
      totalPendapatan,
      totalProduk: uniqueProducts.size,
      totalQty,
      totalTransaksi: data.length,
    }
  };
}

export async function getJurnalStats(ownerId?: number): Promise<JurnalStats> {
  const conditions = [];
  if (ownerId) conditions.push(eq(jurnalPenjualan.created_by, ownerId));
  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const [agg] = await db
    .select({
      totalPendapatan: sql<number>`COALESCE(SUM(${jurnalPenjualan.total_pendapatan}), 0)`,
      totalQty: sql<number>`COALESCE(SUM(${jurnalPenjualan.jumlah_terjual}), 0)`,
    })
    .from(jurnalPenjualan)
    .where(whereCondition);
    
  const [aggProducts] = await db
    .select({
      totalProduk: sql<number>`COUNT(DISTINCT COALESCE(${jurnalItems.nama_item}, ${jurnalPenjualan.nama_item}))`,
    })
    .from(jurnalPenjualan)
    .leftJoin(jurnalItems, eq(jurnalPenjualan.id, jurnalItems.jurnal_id))
    .where(whereCondition);

  return {
    totalPendapatan: Number(agg.totalPendapatan),
    totalProduk: Number(aggProducts.totalProduk),
    totalQty: Number(agg.totalQty),
  };
}
