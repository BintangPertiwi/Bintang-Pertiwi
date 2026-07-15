"use client";

import { getAllCategories, getCategoryConfig } from "@/constants/peta";
import type { FasilitasRow } from "@/types";
import { Input } from "@/components/ui/input";
import {
  ChevronUp,
  MapPin,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface PetaSidebarProps {
  fasilitas: FasilitasRow[];
  activeCategory: string | null;
  searchQuery: string;
  selectedId: string | null;
  onCategoryChange: (category: string | null) => void;
  onSearchChange: (query: string) => void;
  onSelectFasilitas: (id: string) => void;
}

export function PetaSidebar({
  fasilitas,
  activeCategory,
  searchQuery,
  selectedId,
  onCategoryChange,
  onSearchChange,
  onSelectFasilitas,
}: PetaSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const categories = getAllCategories();

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, onSearchChange]);

  const filteredFasilitas = useMemo(() => {
    let items = fasilitas;

    if (activeCategory) {
      items = items.filter((f) => f.kategori_ikon === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (f) =>
          f.nama_fasum.toLowerCase().includes(q) ||
          f.deskripsi.toLowerCase().includes(q) ||
          f.kategori_ikon.toLowerCase().includes(q)
      );
    }

    return items;
  }, [fasilitas, activeCategory, searchQuery]);

  const sidebarContent = (
    <>
      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Cari fasilitas..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-11 pr-12 h-14 bg-white shadow-sm border-slate-200 text-base"
          id="peta-search-input"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              onSearchChange("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            title="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 pb-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
            activeCategory === null
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => {
          const config = getCategoryConfig(cat);
          const count = fasilitas.filter((f) => f.kategori_ikon === cat).length;
          return (
            <button
              key={cat}
              onClick={() =>
                onCategoryChange(activeCategory === cat ? null : cat)
              }
              className={`px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                activeCategory === cat
                  ? "text-white shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
              style={
                activeCategory === cat
                  ? { background: config.color, borderColor: config.color }
                  : undefined
              }
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: activeCategory === cat ? 'white' : config.color }}
              />
              {config.label}
              <span className={activeCategory === cat ? "opacity-90" : "text-slate-400 font-semibold"}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="text-xs text-slate-400 font-medium">
        {filteredFasilitas.length} fasilitas ditemukan
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 -mx-1 px-1 min-h-0">
        {filteredFasilitas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <MapPin className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">Tidak ada fasilitas</p>
            <p className="text-xs mt-1">Coba ubah filter atau kata kunci</p>
          </div>
        ) : (
          filteredFasilitas.map((item) => {
            const config = getCategoryConfig(item.kategori_ikon);
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectFasilitas(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full text-left p-2 transition-colors group cursor-pointer border-b border-slate-100 last:border-b-0 ${
                  isSelected
                    ? "bg-slate-50/80"
                    : "bg-white hover:bg-slate-50/50"
                }`}
              >
                <div className="flex gap-4 items-center">
                  {item.url_foto ? (
                    <div className="relative w-12 h-12 rounded flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.url_foto}
                        alt={item.nama_fasum}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-7 h-7" style={{ color: config.color }} strokeWidth={2} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-[15px] font-bold truncate leading-tight mb-1 transition-colors ${isSelected ? "text-slate-800" : "text-slate-700 group-hover:text-primary"}`}>
                      {item.nama_fasum}
                    </h4>
                    <span
                      className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                      style={{ background: `${config.color}15`, color: config.color }}
                    >
                      {config.label}
                    </span>
                    {item.deskripsi && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-snug">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col absolute top-0 left-0 bottom-0 z-10 w-[450px] bg-white/95 backdrop-blur-md shadow-2xl border-r border-slate-200/50 p-5 gap-3 overflow-hidden">
        <div className="flex items-center gap-2 pb-2">
          <MapPin className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold text-slate-900">Fasilitas</h2>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white shadow-lg rounded-full px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-200/80"
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span>{filteredFasilitas.length} Fasilitas</span>
          <ChevronUp
            className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
              isMobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isMobileOpen
              ? "translate-y-0"
              : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          {/* Handle */}
          <div className="flex items-center justify-center py-3">
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>
          <div className="flex flex-col gap-4 px-5 pb-6 pt-2 overflow-hidden flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Fasilitas</h2>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      </div>
    </>
  );
}
