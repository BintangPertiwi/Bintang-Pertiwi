import { NextResponse } from "next/server";
import { updateGlobalConfig } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
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
      "kontak_person_nama",
      "kontak_person_jabatan",
      "kontak_person_wa",
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

    return NextResponse.json({ success: true, message: "Kontak person berhasil diperbarui" });
  } catch (error) {
    console.error("Failed to update kontak person:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui kontak person" },
      { status: 500 }
    );
  }
}
