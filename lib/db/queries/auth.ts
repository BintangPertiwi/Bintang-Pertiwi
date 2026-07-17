import { db } from "../index";
import { adminAuth } from "../schema";
import { eq } from "drizzle-orm";

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
