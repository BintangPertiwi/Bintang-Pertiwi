import { db } from "../index";
import { adminAuth } from "../schema";
import { eq, like, or, desc, asc, and } from "drizzle-orm";
import type { UserRole } from "@/lib/auth";
import type { PaginatedResult } from "@/types";
import { paginateItems } from "@/lib/listing";

export interface AdminUserSummary {
  id: number;
  username: string;
  role: string;
  nama: string;
  wa_number: string;
}

export async function getAdminByUsername(username: string) {
  const result = await db.select().from(adminAuth).where(eq(adminAuth.username, username));
  return result[0];
}

export async function getAdminById(id: number) {
  const result = await db.select().from(adminAuth).where(eq(adminAuth.id, id));
  return result[0];
}

export async function updateAdminCredentials(currentUsername: string, newUsername: string, hashedPassword: string) {
  const result = await db.update(adminAuth).set({
    username: newUsername,
    password: hashedPassword,
  }).where(eq(adminAuth.username, currentUsername));
  return result.rowsAffected > 0;
}

export async function updateUserWa(id: number, wa_number: string): Promise<boolean> {
  const result = await db.update(adminAuth).set({ wa_number }).where(eq(adminAuth.id, id));
  return result.rowsAffected > 0;
}

export async function getAllUsers(): Promise<AdminUserSummary[]> {
  const rows = await db
    .select({
      id: adminAuth.id,
      username: adminAuth.username,
      role: adminAuth.role,
      nama: adminAuth.nama,
      wa_number: adminAuth.wa_number,
    })
    .from(adminAuth)
    .orderBy(adminAuth.id);
  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    role: r.role,
    nama: r.nama ?? "",
    wa_number: r.wa_number ?? "",
  }));
}

export async function createUser(data: {
  username: string;
  password: string;
  role: string;
  nama: string;
  wa_number: string;
}): Promise<void> {
  await db.insert(adminAuth).values(data);
}

export async function deleteUserById(id: number): Promise<boolean> {
  const result = await db.delete(adminAuth).where(eq(adminAuth.id, id));
  return result.rowsAffected > 0;
}

/**
 * Mendapatkan daftar pengguna dengan paginasi, pencarian, dan filter.
 */
export async function getUserListing({
  q = "",
  filter = "all", // "all", "super_admin", "kontributor"
  page = 1,
  limit = 10,
  sort,
  dir,
}: {
  q?: string;
  filter?: string;
  page?: number;
  limit?: number;
  sort?: string;
  dir?: string;
}): Promise<
  PaginatedResult<typeof adminAuth.$inferSelect> & {
    roles: string[];
  }
> {
  const conditionFilters = [];

  if (q) {
    conditionFilters.push(
      or(
        like(adminAuth.username, `%${q}%`),
        like(adminAuth.nama, `%${q}%`)
      )
    );
  }

  if (filter !== "all") {
    conditionFilters.push(eq(adminAuth.role, filter as UserRole));
  }

  const whereCondition = conditionFilters.length > 0 ? and(...conditionFilters) : undefined;

  let sortColumn;
  if (sort) {
    switch (sort) {
      case "nama": sortColumn = adminAuth.nama; break;
      case "username": sortColumn = adminAuth.username; break;
      case "role": sortColumn = adminAuth.role; break;
      default: sortColumn = adminAuth.id; break;
    }
  }

  const orderByClause = sortColumn
    ? dir === "asc" ? asc(sortColumn) : desc(sortColumn)
    : desc(adminAuth.id);

  const users = await db
    .select()
    .from(adminAuth)
    .where(whereCondition)
    .orderBy(orderByClause);

  // Omit password from result
  const safeUsers = users.map((user) => {
    const { password, ...rest } = user;
    return rest as typeof adminAuth.$inferSelect;
  });

  const roles = ["super_admin", "kontributor"];

  return {
    ...paginateItems(safeUsers, page, limit),
    roles,
  };
}
