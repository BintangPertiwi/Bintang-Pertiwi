import { NextRequest, NextResponse } from "next/server";
import { getJurnalListing, appendJurnal } from "@/lib/db/queries/jurnal";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const q = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";
    const ownerIdParam = searchParams.get("ownerId");
    const ownerId = ownerIdParam ? parseInt(ownerIdParam, 10) : undefined;
    const sort = searchParams.get("sort") || undefined;
    const dir = searchParams.get("dir") || undefined;

    const result = await getJurnalListing({
      page,
      limit,
      q,
      filter,
      ownerId,
      sort,
      dir,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching jurnal:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data jurnal penjualan." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tanggal || !body.nama_item || body.jumlah_terjual === undefined || body.total_pendapatan === undefined || !body.created_by) {
      return NextResponse.json(
        { error: "Data wajib tidak lengkap." },
        { status: 400 }
      );
    }

    await appendJurnal({
      tanggal: body.tanggal,
      nama_item: body.nama_item,
      jumlah_terjual: Number(body.jumlah_terjual),
      total_pendapatan: Number(body.total_pendapatan),
      keterangan: body.keterangan || "",
      created_by: Number(body.created_by),
    });

    revalidateTag("jurnal", "max");

    return NextResponse.json(
      { message: "Jurnal penjualan berhasil ditambahkan." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding jurnal:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan jurnal penjualan." },
      { status: 500 }
    );
  }
}
