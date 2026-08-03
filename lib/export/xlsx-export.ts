import type { JurnalRow } from "@/types/db";
import * as XLSX from "xlsx";

export function generateXlsx(data: (JurnalRow & { authorName?: string })[], filename: string) {
  const worksheetData: Record<string, string | number>[] = [];
  
  data.forEach(jurnal => {
    const tanggal = new Date(jurnal.tanggal).toLocaleDateString("id-ID");
    const ket = jurnal.keterangan || "";
    const author = jurnal.authorName || "-";
    
    const childItems = jurnal.items;
    if (childItems && childItems.length > 0) {
      childItems.forEach((item) => {
        worksheetData.push({
          "Tanggal": tanggal,
          "Produk / Item": item.nama_item,
          "Harga Satuan": item.harga_satuan,
          "Qty": item.jumlah,
          "Subtotal": item.subtotal,
          "Keterangan": ket,
          "Dicatat Oleh": author,
        });
      });
    } else {
      worksheetData.push({
        "Tanggal": tanggal,
        "Produk / Item": jurnal.nama_item,
        "Harga Satuan": 0,
        "Qty": jurnal.jumlah_terjual,
        "Subtotal": jurnal.total_pendapatan,
        "Keterangan": ket,
        "Dicatat Oleh": author,
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
  
  // Format column widths
  const wscols = [
    { wch: 15 }, // Tanggal
    { wch: 35 }, // Produk / Item
    { wch: 15 }, // Harga Satuan
    { wch: 10 }, // Qty
    { wch: 20 }, // Subtotal
    { wch: 40 }, // Keterangan
    { wch: 20 }, // Dicatat Oleh
  ];
  worksheet["!cols"] = wscols;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
