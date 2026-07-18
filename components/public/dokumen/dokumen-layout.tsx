"use client";

import { useMemo, useState } from "react";
import type { DokumenRow } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, Eye, FileText, LayoutGrid, List, Search } from "lucide-react";
import { FileTypeIcon, fileTypeLabel } from "@/components/dokumen/file-type-icon";
import { DokumenPreviewDialog } from "./dokumen-preview-dialog";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DokumenLayout({
  documents,
  categories,
}: {
  documents: DokumenRow[];
  categories: string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const debounced = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [previewDoc, setPreviewDoc] = useState<DokumenRow | null>(null);

  const filtered = useMemo(() => {
    const query = debounced.toLowerCase().trim();
    return documents.filter((d) => {
      const matchesSearch =
        !query || d.judul.toLowerCase().includes(query) || d.deskripsi.toLowerCase().includes(query);
      const matchesCat = activeCategory === "Semua" || d.kategori === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [documents, debounced, activeCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari nama dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 h-12"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("grid")}
            aria-label="Tampilan grid"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setView("list")}
            aria-label="Tampilan daftar"
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filter kategori */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {["Semua", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground">Dokumen tidak ditemukan</p>
          <p className="text-sm text-muted-foreground mt-1">Coba kata kunci atau kategori lain.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((dok) => (
            <button
              key={dok.id}
              type="button"
              onClick={() => setPreviewDoc(dok)}
              className="group flex flex-col text-left cursor-pointer bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all"
            >
              <div className="relative flex items-center justify-center h-32 bg-muted/40">
                <FileTypeIcon tipe={dok.tipe_file} className="h-14 w-14 transition-transform group-hover:scale-110" />
                {dok.kategori && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-card/90 text-foreground rounded-full px-2 py-0.5 border">
                    {dok.kategori}
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug mb-1">
                  {dok.judul}
                </h3>
                <div className="mt-auto flex items-center gap-1.5 text-[11px] text-muted-foreground pt-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(dok.tanggal)}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y border rounded-xl overflow-hidden">
          {filtered.map((dok) => (
            <button
              key={dok.id}
              type="button"
              onClick={() => setPreviewDoc(dok)}
              className="flex items-center gap-4 p-4 text-left cursor-pointer bg-card hover:bg-muted/50 transition-colors"
            >
              <FileTypeIcon tipe={dok.tipe_file} className="h-8 w-8 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">{dok.judul}</h3>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                  {dok.kategori && <span className="uppercase font-medium">{dok.kategori}</span>}
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(dok.tanggal)}
                  </span>
                  <span className="uppercase">{fileTypeLabel(dok.tipe_file)}</span>
                </div>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}

      <DokumenPreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}
