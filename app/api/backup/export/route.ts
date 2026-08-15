import { requireRole } from "@/lib/auth";
import { exportData } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid atau Anda tidak memiliki akses." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tablesParam = searchParams.get("tables");
    let tablesToExport: string[] = [];

    if (tablesParam) {
      tablesToExport = tablesParam.split(",").map((t) => t.trim());
    } else {
      // Default export all
      tablesToExport = [
        "admin_auth",
        "nota_settings",
        "berita_dusun",
        "galeri_dusun",
        "dokumen",
        "produk_umkm",
        "jurnal_penjualan",
        "jurnal_items",
        "perangkat_dusun",
        "global_config",
      ];
    }

    const backupData = await exportData(tablesToExport);

    // Format filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `backup_bintang-pertiwi_${date}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export backup:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengekspor data backup." },
      { status: 500 }
    );
  }
}
