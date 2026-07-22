import { NextRequest, NextResponse } from "next/server";
import { getJurnalById, updateJurnal, deleteJurnalById } from "@/lib/db/queries/jurnal";
import { revalidateTag } from "next/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getJurnalById(id);

    if (!data) {
      return NextResponse.json(
        { error: "Jurnal penjualan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jurnal by id:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data jurnal penjualan." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await updateJurnal(id, {
      tanggal: body.tanggal,
      nama_item: body.nama_item,
      jumlah_terjual: body.jumlah_terjual !== undefined ? Number(body.jumlah_terjual) : undefined,
      total_pendapatan: body.total_pendapatan !== undefined ? Number(body.total_pendapatan) : undefined,
      keterangan: body.keterangan,
    });

    revalidateTag("jurnal", "max");

    return NextResponse.json({ message: "Jurnal penjualan berhasil diperbarui." });
  } catch (error) {
    console.error("Error updating jurnal:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui jurnal penjualan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteJurnalById(id);

    if (!success) {
      return NextResponse.json(
        { error: "Jurnal penjualan tidak ditemukan atau sudah dihapus." },
        { status: 404 }
      );
    }

    revalidateTag("jurnal", "max");

    return NextResponse.json({ message: "Jurnal penjualan berhasil dihapus." });
  } catch (error) {
    console.error("Error deleting jurnal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus jurnal penjualan." },
      { status: 500 }
    );
  }
}
