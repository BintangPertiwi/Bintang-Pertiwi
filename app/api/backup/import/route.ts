import { requireRole } from "@/lib/auth";
import { importData } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid atau Anda tidak memiliki akses." },
        { status: 401 }
      );
    }

    const data = await request.json();

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { success: false, message: "Format file tidak valid." },
        { status: 400 }
      );
    }

    const summary = await importData(data);

    // Revalidate all caches after a successful restore
    revalidateTag("global-config", "max");
    revalidateTag("berita", "max");
    revalidateTag("galeri", "max");
    revalidateTag("dokumen", "max");
    revalidateTag("produk", "max");
    revalidateTag("jurnal", "max");
    revalidateTag("perangkat", "max");
    revalidateTag("nota", "max");

    return NextResponse.json({
      success: true,
      message: "Data backup berhasil di-import.",
      summary,
    });
  } catch (error: unknown) {
    console.error("Failed to import backup:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan saat meng-import data backup.", 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
