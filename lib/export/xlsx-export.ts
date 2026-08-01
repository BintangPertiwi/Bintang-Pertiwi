import type { JurnalRow } from "@/types/db";
import * as XLSX from "xlsx";

export function generateXlsx(data: (JurnalRow & { authorName?: string })[], filename: string) {
  const worksheetData = data.map(item => ({
    "Tanggal": new Date(item.tanggal).toLocaleDateString("id-ID"),
    "Produk / Item": item.nama_item,
    "Qty": item.jumlah_terjual,
    "Total Pendapatan": item.total_pendapatan,
    "Keterangan": item.keterangan || "",
    "Dicatat Oleh": item.authorName || "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
  
  // Format column widths
  const wscols = [
    { wch: 15 }, // Tanggal
    { wch: 35 }, // Produk
    { wch: 10 }, // Qty
    { wch: 20 }, // Total
    { wch: 40 }, // Keterangan
    { wch: 20 }, // Dicatat Oleh
  ];
  worksheet["!cols"] = wscols;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
