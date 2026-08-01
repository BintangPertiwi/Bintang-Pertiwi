import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FALLBACK_LOGO_BASE64, PDF_COLORS, imageUrlToBase64 } from "./pdf-styles";
import type { JurnalRow } from "@/types/db";
import type { NotaBranding } from "./nota-generator";

export interface ReportData {
  items: (JurnalRow & { authorName: string })[];
  stats: {
    totalPendapatan: number;
    totalProduk: number;
    totalQty: number;
    totalTransaksi: number;
  };
  filters: {
    periode: string;
    produk?: string;
  };
  branding: NotaBranding;
}

export async function generateReportPdf(data: ReportData): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Draw header background gradient simulation
  doc.setFillColor(PDF_COLORS.primary[0], PDF_COLORS.primary[1], PDF_COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 30, "F");

  // 2. Draw Logo
  const logoBase64 = await imageUrlToBase64(data.branding.url_logo);
  let finalLogo = logoBase64;
  try {
    doc.addImage(logoBase64, 'PNG', 15, 5, 20, 20, 'LOGO', 'FAST');
  } catch {
    try {
      finalLogo = FALLBACK_LOGO_BASE64;
      doc.addImage(FALLBACK_LOGO_BASE64, 'PNG', 15, 5, 20, 20, 'LOGO', 'FAST');
    } catch { /* ignore */ }
  }

  // 3. Header Texts
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(data.branding.nama_usaha.toUpperCase() || "BINTANG PERTIWI", 40, 13);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Penjualan", 40, 19);
  doc.text(`Periode: ${data.filters.periode}`, 40, 24);

  // 4. Summary Stats
  doc.setTextColor(PDF_COLORS.text[0], PDF_COLORS.text[1], PDF_COLORS.text[2]);
  
  const drawSummaryCard = (x: number, y: number, w: number, h: number, title: string, value: string) => {
    // Background #f0fcd4
    doc.setFillColor(240, 252, 212);
    doc.roundedRect(x, y, w, h, 2, 2, "F");
    // Left border
    doc.setFillColor(PDF_COLORS.primary[0], PDF_COLORS.primary[1], PDF_COLORS.primary[2]);
    doc.rect(x, y, 2, h, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(value, x + 5, y + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(PDF_COLORS.muted[0], PDF_COLORS.muted[1], PDF_COLORS.muted[2]);
    doc.text(title, x + 5, y + 14);
    
    doc.setTextColor(PDF_COLORS.text[0], PDF_COLORS.text[1], PDF_COLORS.text[2]); // reset
  };

  const cardWidth = (pageWidth - 30 - 15) / 4; // 4 cards with 5mm gap
  const cardY = 40;
  
  drawSummaryCard(15, cardY, cardWidth, 18, "Total Pendapatan", `Rp ${data.stats.totalPendapatan.toLocaleString('id-ID')}`);
  drawSummaryCard(15 + cardWidth + 5, cardY, cardWidth, 18, "Total Transaksi", data.stats.totalTransaksi.toString());
  drawSummaryCard(15 + (cardWidth + 5)*2, cardY, cardWidth, 18, "Produk Terjual", data.stats.totalProduk.toString());
  drawSummaryCard(15 + (cardWidth + 5)*3, cardY, cardWidth, 18, "Total Kuantitas", data.stats.totalQty.toString());

  // 5. Table Data
  const tableData = data.items.map((item, idx) => [
    idx + 1,
    new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }),
    item.nama_item,
    item.jumlah_terjual,
    `Rp ${item.total_pendapatan.toLocaleString('id-ID')}`
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['No', 'Tanggal', 'Produk', 'Qty', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: PDF_COLORS.primary as [number, number, number],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'left', cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 35 }
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    margin: { left: 15, right: 15 },
    
    // Add watermark on every page inside didDrawPage
    didDrawPage: () => {
      // Draw watermark
      type GStateConstructor = new (options: { opacity: number }) => unknown;
      const docWithGState = doc as unknown as { GState: GStateConstructor };
      
      doc.setGState(new docWithGState.GState({ opacity: 0.05 }));
      try {
        doc.addImage(finalLogo, 'PNG', pageWidth/2 - 40, pageHeight/2 - 40, 80, 80, 'LOGO', 'FAST');
      } catch {}
      doc.setGState(new docWithGState.GState({ opacity: 1.0 }));
      
      // Draw footer
      const footerY = pageHeight - 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(PDF_COLORS.muted[0], PDF_COLORS.muted[1], PDF_COLORS.muted[2]);
      
      const now = new Date().toLocaleString('id-ID');
      doc.text(`Digenerate: ${now}`, 15, footerY);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(PDF_COLORS.primary[0], PDF_COLORS.primary[1], PDF_COLORS.primary[2]);
      doc.text("bintangpertiwi.com", pageWidth - 15, footerY, { align: "right" });
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(PDF_COLORS.text[0], PDF_COLORS.text[1], PDF_COLORS.text[2]);
    }
  });

  return doc.output("blob");
}
