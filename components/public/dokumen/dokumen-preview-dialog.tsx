"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import type { DokumenRow } from "@/types";

const OFFICE_EXT = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

function toDownloadUrl(url: string): string {
  // Paksa Cloudinary menyajikan sebagai attachment (unduh).
  return url.includes("/upload/") ? url.replace("/upload/", "/upload/fl_attachment/") : url;
}

export function DokumenPreviewDialog({
  doc,
  onClose,
}: {
  doc: DokumenRow | null;
  onClose: () => void;
}) {
  const tipe = (doc?.tipe_file || "").toLowerCase();
  const isPdf = tipe === "pdf";
  const isTxt = tipe === "txt";
  const isOffice = OFFICE_EXT.includes(tipe);

  return (
    <Dialog open={!!doc} onOpenChange={(open) => { if (!open) onClose(); }}>
      {/* Override sm:max-w-sm bawaan Dialog agar bisa hampir full-layar + flex column */}
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[96vw] h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b shrink-0">
          <DialogTitle className="text-base font-bold truncate pr-8">
            {doc?.judul || "Pratinjau Dokumen"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-muted">
          {doc && (isPdf || isTxt) ? (
            <iframe
              src={doc.url_file}
              title={doc.judul}
              className="w-full h-full border-0 bg-white"
            />
          ) : doc && isOffice ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(doc.url_file)}`}
              title={doc.judul}
              className="w-full h-full border-0 bg-white"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground px-6 text-center">
              Pratinjau tidak tersedia untuk tipe file ini. Silakan unduh atau buka di tab baru.
            </div>
          )}
        </div>

        {doc && (
          <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-t shrink-0 bg-card">
            <Button
              render={
                <a href={toDownloadUrl(doc.url_file)} target="_blank" rel="noopener noreferrer" />
              }
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Unduh
            </Button>
            <Button
              variant="outline"
              render={<a href={doc.url_file} target="_blank" rel="noopener noreferrer" />}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Buka di tab baru
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
