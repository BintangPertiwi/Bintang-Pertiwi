import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getJurnalExportData } from "@/lib/db/queries/jurnal";
import { getNotaSettings } from "@/lib/db/queries/nota-settings";
import type { ListingQueryParams } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";
    const month = searchParams.get("month") || undefined;
    const year = searchParams.get("year") || undefined;
    const product = searchParams.get("product") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    
    // Only fetch for owner if they are a contributor
    const ownerId = session.role === "kontributor" ? session.id : undefined;

    const queryParams: ListingQueryParams & { ownerId?: number } = {
      q,
      filter,
      month,
      year,
      product,
      dateFrom,
      dateTo,
      page: 1, // Doesn't matter for export but required by type
      limit: 10,
      ownerId,
    };

    const data = await getJurnalExportData(queryParams);
    const branding = await getNotaSettings(session.id);

    return NextResponse.json({ ...data, branding });
  } catch (error) {
    console.error("Error exporting jurnal:", error);
    return NextResponse.json({ error: "Gagal mengekspor data" }, { status: 500 });
  }
}
