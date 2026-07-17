import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt";

export type UserRole = "super_admin" | "kontributor";

export interface AdminSession {
  id: number;
  username: string;
  role: UserRole;
}

export function normalizeRole(value: unknown): UserRole {
  return value === "kontributor" ? "kontributor" : "super_admin";
}

/**
 * Membaca & memverifikasi sesi dari cookie. Mengembalikan payload sesi
 * (id, username, role) bila valid, atau null. Token lama tanpa `id`
 * dianggap tidak valid agar dipaksa login ulang.
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const id = Number(payload.id);
    const username = typeof payload.username === "string" ? payload.username : "";
    if (!Number.isFinite(id) || id <= 0 || !username) return null;
    return { id, username, role: normalizeRole(payload.role) };
  } catch {
    return null;
  }
}

/**
 * Kompatibel dengan pola lama `if (!(await verifyAdminSession()))`.
 * Mengembalikan sesi (truthy) bila valid, atau null.
 */
export async function verifyAdminSession(): Promise<AdminSession | null> {
  return getSession();
}

export function hasRole(session: AdminSession | null, roles: UserRole[]): boolean {
  return !!session && roles.includes(session.role);
}

/** Ambil sesi lalu pastikan role termasuk `roles`. Null bila gagal. */
export async function requireRole(roles: UserRole[]): Promise<AdminSession | null> {
  const session = await getSession();
  return hasRole(session, roles) ? session : null;
}
