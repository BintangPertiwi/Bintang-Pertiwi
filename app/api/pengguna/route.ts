import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createUser, getAdminByUsername } from "@/lib/db/queries";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Super Admin." },
        { status: 403 }
      );
    }

    const { username, password, nama, wa_number, role } = await request.json();

    if (!username || typeof username !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const finalRole = role === "super_admin" ? "super_admin" : "kontributor";

    const existing = await getAdminByUsername(username.trim());
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser({
      username: username.trim(),
      password: hashedPassword,
      role: finalRole,
      nama: (nama || "").trim(),
      wa_number: (wa_number || "").trim(),
    });

    return NextResponse.json({ success: true, message: "Akun berhasil dibuat." });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat akun." },
      { status: 500 }
    );
  }
}
