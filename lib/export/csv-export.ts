import type { JurnalRow } from "@/types/db";

export function generateCsv(data: (JurnalRow & { authorName?: string })[], filename: string) {
  const headers = ["Tanggal", "Produk/Item", "Qty", "Total Pendapatan", "Keterangan", "Dicatat Oleh"];
  
  const rows = data.map(item => [
    new Date(item.tanggal).toLocaleDateString("id-ID"),
    `"${item.nama_item.replace(/"/g, '""')}"`, // escape quotes for CSV
    item.jumlah_terjual,
    item.total_pendapatan,
    `"${(item.keterangan || "").replace(/"/g, '""')}"`,
    `"${(item.authorName || "-").replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
