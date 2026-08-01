import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FALLBACK_LOGO_BASE64, PDF_COLORS, imageUrlToBase64 } from "./pdf-styles";

export interface NotaData {
  id: string;
  tanggal: string;
  nama_item: string;
  jumlah_terjual: number;
  total_pendapatan: number;
  keterangan: string;
  authorName: string;
}

export interface NotaBranding {
  nama_usaha: string;
  alamat: string;
  nomor_telepon: string;
  url_logo: string;
}

export async function generateNotaPdf(data: NotaData, branding: NotaBranding): Promise<Blob> {
  // A5 format: 148 x 210 mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFillColor(PDF_COLORS.primary[0], PDF_COLORS.primary[1], PDF_COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 4, "F");

  const logoBase64 = await imageUrlToBase64(branding.url_logo);
  try {
    doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20, 'LOGO', 'FAST');
  } catch {
    try {
      doc.addImage(FALLBACK_LOGO_BASE64, 'PNG', 15, 10, 20, 20, 'LOGO', 'FAST');
    } catch {
      // ignore
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setTextColor(PDF_COLORS.text[0], PDF_COLORS.text[1], PDF_COLORS.text[2]);
  doc.setFontSize(14);
  doc.text(branding.nama_usaha.toUpperCase() || "BINTANG PERTIWI", 40, 16);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(PDF_COLORS.muted[0], PDF_COLORS.muted[1], PDF_COLORS.muted[2]);
  doc.setFontSize(8);
  
  const addressLines = doc.splitTextToSize(branding.alamat, 95);
  doc.text(addressLines, 40, 21);
  
  if (branding.nomor_telepon) {
    doc.text(`Telp/WA: ${branding.nomor_telepon}`, 40, 21 + (addressLines.length * 4));
  }

  // Horizontal line
  const lineY = 35;
  doc.setDrawColor(PDF_COLORS.muted[0], PDF_COLORS.muted[1], PDF_COLORS.muted[2]);
  doc.setLineWidth(0.2);
  doc.line(15, lineY, pageWidth - 15, lineY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(PDF_COLORS.text[0], PDF_COLORS.text[1], PDF_COLORS.text[2]);
  doc.setFontSize(12);
  doc.text("NOTA PENJUALAN", 15, lineY + 8);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const d = new Date(data.tanggal);
  const tglFormatted = !isNaN(d.getTime()) 
    ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : data.tanggal;

  doc.text(`Tanggal: ${tglFormatted}`, 15, lineY + 14);
  doc.text(`Dicatat: ${data.authorName || "-"}`, 15, lineY + 19);
  
  const invoiceNo = `INV-${data.tanggal.replace(/-/g, '')}-${data.id.substring(0, 4).toUpperCase()}`;
  const invWidth = doc.getTextWidth(`No: ${invoiceNo}`);
  doc.text(`No: ${invoiceNo}`, pageWidth - 15 - invWidth, lineY + 8);

  autoTable(doc, {
    startY: lineY + 25,
    head: [['Produk / Item', 'Qty', 'Total']],
    body: [
      [
        data.nama_item, 
        data.jumlah_terjual.toString(), 
        `Rp ${data.total_pendapatan.toLocaleString('id-ID')}`
      ]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: PDF_COLORS.primary as [number, number, number],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 35 }
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      lineColor: [226, 232, 240] 
    },
    margin: { left: 15, right: 15 }
  });
  let finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  if (data.keterangan) {
    const notes = doc.splitTextToSize(data.keterangan, pageWidth - 30);
    const notesHeight = notes.length * 4;
    
    if (finalY + notesHeight > pageHeight - 25) {
      doc.addPage();
      finalY = 15; // Reset Y for new page
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Keterangan:", 15, finalY);
    
    doc.setFont("helvetica", "normal");
    doc.text(notes, 15, finalY + 5);
    
    finalY = finalY + 5 + notesHeight;
  }

  // Ensure footer is at bottom or after content
  const footerY = Math.max(pageHeight - 15, finalY + 15);
  
  if (footerY > pageHeight - 5) {
    doc.addPage();
    finalY = 15;
  }
  
  const finalFooterY = footerY > pageHeight - 5 ? pageHeight - 15 : footerY;

  doc.setFont("helvetica", "italic");
  doc.setTextColor(PDF_COLORS.muted[0], PDF_COLORS.muted[1], PDF_COLORS.muted[2]);
  doc.setFontSize(8);
  doc.text("Terima kasih atas kepercayaannya!", pageWidth / 2, finalFooterY, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PDF_COLORS.primary[0], PDF_COLORS.primary[1], PDF_COLORS.primary[2]);
  doc.text("bintangpertiwi.com", pageWidth / 2, finalFooterY + 5, { align: "center" });

  return doc.output("blob");
}
