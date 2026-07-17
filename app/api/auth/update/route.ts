import { NextResponse } from "next/server";
import { getAdminByUsername, updateAdminCredentials } from "@/lib/db/queries";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getJwtSecret } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { newUsername, oldPassword, newPassword } = await request.json();

    if (!newUsername || !oldPassword) {
      return NextResponse.json(
        { message: "Username dan Password Lama harus diisi" },
        { status: 400 }
      );
    }

    if (newPassword && String(newPassword).length < 8) {
      return NextResponse.json(
        { message: "Password baru minimal 8 karakter." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ message: "Tidak ada sesi aktif" }, { status: 401 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token, getJwtSecret());
      payload = verified.payload;
    } catch {
      return NextResponse.json({ message: "Sesi tidak valid" }, { status: 401 });
    }

    const currentUsername = payload.username as string;

    const adminRow = await getAdminByUsername(currentUsername);

    if (!adminRow) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const storedHashedPassword = adminRow.password;
    const isPasswordValid = await bcrypt.compare(oldPassword, storedHashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password lama salah" },
        { status: 401 }
      );
    }

    const finalPassword = newPassword 
      ? await bcrypt.hash(newPassword, 10) 
      : storedHashedPassword;

    await updateAdminCredentials(currentUsername, newUsername, finalPassword);
    
    cookieStore.delete("admin_session");

    return NextResponse.json({ success: true, message: "Pengaturan akun berhasil diperbarui. Silakan login kembali." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Update auth error:", error.message);
    } else {
      console.error("Update auth error:", error);
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
