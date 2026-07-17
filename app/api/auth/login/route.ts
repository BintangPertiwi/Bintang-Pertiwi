import { NextResponse } from "next/server";
import { getAdminByUsername } from "@/lib/db/queries";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_for_dev_only"
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    const adminRow = await getAdminByUsername(username);

    if (!adminRow) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    const storedHashedPassword = adminRow.password;
    const isPasswordValid = await bcrypt.compare(password, storedHashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Buat token JWT (memuat id & role untuk kontrol akses multi-role)
    const token = await new SignJWT({
      id: adminRow.id,
      username: adminRow.username,
      role: adminRow.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
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
