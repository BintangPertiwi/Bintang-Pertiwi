import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { deleteUserById } from "@/lib/db/queries";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["super_admin"]);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya Super Admin." },
        { status: 403 }
      );
    }

    const id = Number((await params).id);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { success: false, message: "ID akun tidak valid." },
        { status: 400 }
      );
    }

    // Cegah menghapus akun yang sedang dipakai.
    if (id === session.id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menghapus akun sendiri." },
        { status: 400 }
      );
    }

    const success = await deleteUserById(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Akun berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus akun." },
      { status: 500 }
    );
  }
}
