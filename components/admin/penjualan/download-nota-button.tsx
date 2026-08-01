"use client"

import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { generateNotaPdf, type NotaData, type NotaBranding } from "@/lib/pdf/nota-generator"

interface DownloadNotaButtonProps {
  data: NotaData;
  branding: NotaBranding;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showText?: boolean;
}

export function DownloadNotaButton({ data, branding, variant = "ghost", className, showText = false }: DownloadNotaButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const blob = await generateNotaPdf(data, branding);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      const cleanName = data.nama_item.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
      link.download = `Nota-${cleanName}-${data.tanggal}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal men-generate nota PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      onClick={handleDownload}
      disabled={isGenerating}
      title="Unduh Nota PDF"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">{isGenerating ? "Proses..." : "Unduh Nota"}</span>
      )}
    </Button>
  );
}
