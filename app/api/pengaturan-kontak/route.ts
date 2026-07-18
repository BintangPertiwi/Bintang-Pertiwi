import { requireRole } from "@/lib/auth";
import { updateGlobalConfig } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }
    const data = await request.json();

    if (typeof data !== "object" || data === null) {
      return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
    }

    const allowedKeys = [
      "kontak_header_title",
      "kontak_header_desc",
    ];

    const updates: Record<string, string> = {};
    for (const key of allowedKeys) {
      if (typeof data[key] === "string") {
        updates[key] = data[key];
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateGlobalConfig(updates);
      revalidateTag("global-config", "max");
    }

    return NextResponse.json({ success: true, message: "Pengaturan kontak berhasil diperbarui" });
  } catch (error) {
    console.error("Failed to update pengaturan kontak:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui pengaturan" },
      { status: 500 }
    );
  }
}
