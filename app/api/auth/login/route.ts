import { NextResponse } from "next/server";
import { getAdminByUsername } from "@/lib/db/queries";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getJwtSecret } from "@/lib/jwt";

// Rate limit sederhana in-memory (per instance). Menghambat brute-force /
// credential stuffing. Kunci = IP + username.
const MAX_FAILED = 5;
const WINDOW_MS = 15 * 60 * 1000; // jendela hitung percobaan
const LOCK_MS = 15 * 60 * 1000; // durasi lockout setelah batas

interface Attempt {
  count: number;
  first: number;
  lockedUntil?: number;
}
const attempts = new Map<string, Attempt>();

// Hash bcrypt valid untuk menyamakan waktu respons saat username tidak ada
// (mencegah user enumeration via timing).
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function secondsLocked(key: string): number | null {
  const a = attempts.get(key);
  if (a?.lockedUntil && a.lockedUntil > Date.now()) {
    return Math.ceil((a.lockedUntil - Date.now()) / 1000);
  }
  return null;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || now - a.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return;
  }
  a.count += 1;
  if (a.count >= MAX_FAILED) {
    a.lockedUntil = now + LOCK_MS;
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    const key = `${getClientIp(request)}:${String(username).toLowerCase()}`;

    const lockedFor = secondsLocked(key);
    if (lockedFor !== null) {
      return NextResponse.json(
        { message: `Terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil(lockedFor / 60)} menit.` },
        { status: 429 }
      );
    }

    const adminRow = await getAdminByUsername(username);

    if (!adminRow) {
      // Tetap jalankan bcrypt agar waktu respons konsisten.
      await bcrypt.compare(password, DUMMY_HASH);
      recordFailure(key);
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, adminRow.password);

    if (!isPasswordValid) {
      recordFailure(key);
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Login sukses → reset penghitung.
    attempts.delete(key);

    // Buat token JWT (memuat id & role untuk kontrol akses multi-role)
    const token = await new SignJWT({
      id: adminRow.id,
      username: adminRow.username,
      role: adminRow.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(getJwtSecret());

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Login berhasil" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Login error:", error.message);
    } else {
      console.error("Login error:", error);
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
