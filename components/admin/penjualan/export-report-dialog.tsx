"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Download, FileDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { generateCsv } from "@/lib/export/csv-export"
import { generateXlsx } from "@/lib/export/xlsx-export"
import { generateReportPdf, type ReportData } from "@/lib/pdf/report-generator"
import { toast } from "sonner"
import type { NotaBranding } from "@/lib/pdf/nota-generator"

interface ExportReportDialogProps {
  currentQuery: Record<string, string | undefined>;
}

export function ExportReportDialog({ currentQuery }: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<"csv" | "xlsx" | "pdf" | null>(null);

  const getPeriodeLabel = () => {
    if (currentQuery.dateFrom && currentQuery.dateTo) {
      return `${currentQuery.dateFrom} s/d ${currentQuery.dateTo}`;
    }
    if (currentQuery.month && currentQuery.year) {
      return `${currentQuery.month}/${currentQuery.year}`;
    }
    if (currentQuery.year) return `Tahun ${currentQuery.year}`;
    if (currentQuery.month) return `Bulan ${currentQuery.month}`;
    return "Semua Waktu";
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      setIsExporting(format);
      
      const searchParams = new URLSearchParams();
      Object.entries(currentQuery).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/jurnal/export?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Gagal mengambil data");
      
      const { items, stats, branding } = await response.json();
      
      if (items.length === 0) {
        toast.error("Tidak ada data untuk diexport pada filter ini");
        return;
      }

      const periode = getPeriodeLabel();
      const filename = `Laporan-Penjualan-${periode.replace(/[^a-zA-Z0-9]/g, '-')}`;

      if (format === "csv") {
        generateCsv(items, filename);
      } else if (format === "xlsx") {
        generateXlsx(items, filename);
      } else if (format === "pdf") {
        const reportData: ReportData = {
          items,
          stats,
          branding: branding as NotaBranding,
          filters: {
            periode,
            produk: currentQuery.product !== "all" ? currentQuery.product : undefined,
          }
        };
        const blob = await generateReportPdf(reportData);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }
      
      toast.success(`Berhasil export ke ${format.toUpperCase()}`);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan export data");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button 
          variant="outline" 
          className="h-14 text-base w-full lg:w-auto bg-background shadow-sm border-muted-foreground/20 text-foreground hover:bg-muted hover:text-foreground hover:border-slate-400/80" 
        />
      }>
          <Download className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          Export Laporan
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Laporan Penjualan</DialogTitle>
          <DialogDescription>
            Pilih format file untuk mengunduh laporan sesuai filter yang aktif.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/30 p-4 rounded-md border text-sm space-y-2 my-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Periode:</span>
            <span className="font-medium">{getPeriodeLabel()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Produk:</span>
            <span className="font-medium">{currentQuery.product === "all" || !currentQuery.product ? "Semua Produk" : currentQuery.product}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 py-4">
          <Button 
            variant="outline" 
            className="justify-start h-12" 
            onClick={() => handleExport("pdf")}
            disabled={isExporting !== null}
          >
            {isExporting === "pdf" ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <FileDown className="mr-3 h-5 w-5 text-red-500" />}
            <div className="text-left flex flex-col">
              <span className="font-semibold">Format PDF</span>
              <span className="text-[10px] text-muted-foreground">Laporan formal dengan logo & kop</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-12" 
            onClick={() => handleExport("xlsx")}
            disabled={isExporting !== null}
          >
            {isExporting === "xlsx" ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <FileSpreadsheet className="mr-3 h-5 w-5 text-green-600" />}
            <div className="text-left flex flex-col">
              <span className="font-semibold">Format Excel (XLSX)</span>
              <span className="text-[10px] text-muted-foreground">Laporan dalam format spreadsheet</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-12" 
            onClick={() => handleExport("csv")}
            disabled={isExporting !== null}
          >
            {isExporting === "csv" ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <FileText className="mr-3 h-5 w-5 text-slate-500" />}
            <div className="text-left flex flex-col">
              <span className="font-semibold">Format CSV</span>
              <span className="text-[10px] text-muted-foreground">Data mentah untuk diproses sistem lain</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
