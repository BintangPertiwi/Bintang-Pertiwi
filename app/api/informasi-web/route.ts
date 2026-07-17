import { NextResponse } from "next/server";
import { updateGlobalConfig } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth";

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
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }
    
    const allowedKeys = [
      "info_deskripsi",
      "info_alamat",
      "info_email",
      "info_telepon",
      "info_facebook",
      "info_instagram",
      "info_youtube",
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
    
    return NextResponse.json({ success: true, message: "Informasi web berhasil diperbarui" });
  } catch (error) {
    console.error("Failed to update informasi web:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui informasi web" },
      { status: 500 }
    );
  }
}
