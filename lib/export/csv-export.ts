import type { JurnalRow } from "@/types/db";

export function generateCsv(data: (JurnalRow & { authorName?: string })[], filename: string) {
  const headers = ["Tanggal", "Produk/Item", "Harga Satuan", "Qty", "Subtotal", "Keterangan", "Dicatat Oleh"];
  
  const rows: (string | number)[][] = [];
  data.forEach(jurnal => {
    const tanggal = new Date(jurnal.tanggal).toLocaleDateString("id-ID");
    const ket = `"${(jurnal.keterangan || "").replace(/"/g, '""')}"`;
    const author = `"${(jurnal.authorName || "-").replace(/"/g, '""')}"`;
    
    const childItems = jurnal.items;
    if (childItems && childItems.length > 0) {
      childItems.forEach((item) => {
        rows.push([
          tanggal,
          `"${item.nama_item.replace(/"/g, '""')}"`,
          item.harga_satuan,
          item.jumlah,
          item.subtotal,
          ket,
          author
        ]);
      });
    } else {
      rows.push([
        tanggal,
        `"${jurnal.nama_item.replace(/"/g, '""')}"`,
        0,
        jurnal.jumlah_terjual,
        jurnal.total_pendapatan,
        ket,
        author
      ]);
    }
  });

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
