"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
export interface BeritaItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  image: string;
  category: string;
}

interface BeritaLayoutProps {
  items: BeritaItem[];
  categories: string[];
}

export function BeritaLayout({ items, categories }: BeritaLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeYear, setActiveYear] = useState("Semua Tahun");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;


  const uniqueYears = Array.from(
    new Set(items.map(item => item.date.split(" ").pop() || ""))
  ).filter(Boolean).sort((a, b) => Number(b) - Number(a));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(deferredSearchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(deferredSearchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || item.category === activeCategory;
    const itemYear = item.date.split(" ").pop() || "";
    const matchesYear = activeYear === "Semua Tahun" || itemYear === activeYear;
    return matchesSearch && matchesCategory && matchesYear;
  });

  const isSearching = deferredSearchQuery.length > 0 || activeCategory !== "Semua" || activeYear !== "Semua Tahun";
  
  const highlightItem = !isSearching && currentPage === 1 && items.length > 0 ? filteredItems[0] : null;
  const listItemsBase = highlightItem && currentPage === 1 ? filteredItems.slice(1) : filteredItems;
  
  const totalPages = Math.max(1, Math.ceil(listItemsBase.length / ITEMS_PER_PAGE));
  const currentListItems = listItemsBase.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const popularItems = items.slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      {highlightItem && (
        <FadeIn direction="up" className="mb-4 md:mb-8">
          <Link href={`/berita/${highlightItem.id}`} className="group flex flex-col md:flex-row gap-8 items-start border-b border-border pb-16 md:pb-24">
            <div className="w-full md:w-[65%] aspect-video relative overflow-hidden bg-muted">
              <Image 
                src={highlightItem.image} 
                alt={highlightItem.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 65vw"
                priority
              />
            </div>
            <div className="w-full md:w-[35%] flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary text-foreground text-xs font-bold uppercase tracking-wider">
                  {highlightItem.category.toUpperCase()}
                </span>
                <span className="flex items-center text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {highlightItem.date}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6 group-hover:text-primary transition-colors">
                {highlightItem.title}
              </h2>
              <p className="text-muted-foreground text-lg mb-3 line-clamp-4 leading-relaxed">
                {highlightItem.summary}
              </p>
              <div className="inline-flex items-center text-foreground font-bold pb-1 self-start group-hover:gap-2 transition-all">
                BACA SELENGKAPNYA <ChevronRight className="w-5 h-5 ml-1 text-primary" />
              </div>
            </div>
          </Link>
        </FadeIn>
      )}

      {/* Search and Year Filter Bar */}
      <FadeIn direction="up" delay={0.1} className="flex flex-col lg:flex-row items-center gap-3 w-full mb-12 md:mb-16 pb-8 border-b border-border">
        <div className="flex w-full lg:flex-1 items-center gap-2">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text" 
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-12 h-14 bg-background shadow-sm border-border text-base"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                title="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row w-full lg:w-auto items-center gap-2 shrink-0">
          {(searchQuery || activeCategory !== "Semua" || activeYear !== "Semua Tahun") && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => { setSearchQuery(""); setActiveCategory("Semua"); setActiveYear("Semua Tahun"); setCurrentPage(1); }} 
              className="h-14 px-4 shrink-0 w-full lg:w-auto order-last lg:order-0"
              title="Reset semua pencarian & filter"
            >
              <span className="mr-2">Reset Filter</span>
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Year Filter */}
          <Select value={activeYear} onValueChange={(val) => { setActiveYear(val || "Semua Tahun"); setCurrentPage(1); }}>
            <SelectTrigger className="h-14 w-full lg:w-[220px] cursor-pointer bg-background shadow-sm border-border text-base relative overflow-visible">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  {activeYear !== "Semua Tahun" && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                  )}
                </div>
                <span className="flex flex-1 text-left truncate">
                  {activeYear}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              <SelectItem value="Semua Tahun">Semua Tahun</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FadeIn>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column (Main List) */}
        <div className="w-full lg:w-[70%] order-2 lg:order-1">
          {isSearching && (
            <div className="mb-8 pb-4 border-b border-border flex justify-between items-end">
              <h3 className="text-2xl font-bold text-foreground">
                {searchQuery ? `Pencarian: "${searchQuery}"` : `Kategori: ${activeCategory}`}
              </h3>
              <span className="text-muted-foreground">{filteredItems.length} berita</span>
            </div>
          )}

          {currentListItems.length > 0 ? (
            <div className="flex flex-col gap-10">
              {currentListItems.map((item, index) => (
                <FadeIn key={item.id} direction="up" delay={Math.min(index * 0.05, 0.2)}>
                  <Link href={`/berita/${item.id}`} className="group flex flex-col sm:flex-row gap-6 items-start pb-10 border-b border-border">
                    <div className="w-full sm:w-[40%] aspect-[4/3] relative overflow-hidden bg-muted flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 40vw"
                        priority={index < 2}
                      />
                    </div>
                    <div className="w-full sm:w-[60%] flex flex-col py-2">
                      <span className="bg-primary text-foreground px-2.5 py-1 inline-block w-fit text-xs font-bold uppercase tracking-wider mb-3">
                        {item.category.toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mt-auto gap-4 sm:gap-0 pt-2">
                        <span className="flex items-center text-muted-foreground text-sm font-medium">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {item.date}
                        </span>
                        <div className="inline-flex items-center text-foreground text-sm font-bold group-hover:text-primary group-hover:gap-1.5 transition-all">
                          BACA SELENGKAPNYA <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 border-t border-border pt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1}
                    className="hidden sm:flex px-3"
                    title="Halaman Pertama"
                  >
                    <ChevronsLeft className="w-4 h-4 mr-1" />
                    First
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    disabled={currentPage === 1}
                    className="px-3"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return (
                          <Button
                            key={i}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10 h-10 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={i} className="text-muted-foreground px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={currentPage === totalPages}
                    className="px-3"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(totalPages)} 
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex px-3"
                    title="Halaman Terakhir"
                  >
                    Last
                    <ChevronsRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center border border-dashed border-border">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Belum Ada Berita</h3>
              <p className="text-muted-foreground">Saat ini belum ada berita atau pengumuman yang ditambahkan.</p>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center border border-dashed border-border">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Berita tidak ditemukan</h3>
              <p className="text-muted-foreground">Silakan gunakan kata kunci lain atau pilih kategori berbeda.</p>
              <Button
                onClick={() => { setSearchQuery(""); setActiveCategory("Semua"); setActiveYear("Semua Tahun"); setCurrentPage(1); }}
                className="mt-4"
                >
                Tampilkan Semua Berita
              </Button>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-12 order-1 lg:order-2">
          
          {/* Categories */}
          <FadeIn direction="up" delay={0.2}>
            <h4 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider pb-2 border-b-2 border-primary inline-block">Kategori</h4>
            <ul className="flex flex-col">
              <li 
                className={`cursor-pointer py-3 border-b border-border transition-colors flex justify-between items-center group ${activeCategory === "Semua" ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"}`}
                onClick={() => { setActiveCategory("Semua"); setCurrentPage(1); }}
              >
                <span>SEMUA BERITA</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === "Semua" ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              </li>
              {categories.map(cat => (
                <li 
                  key={cat}
                  className={`cursor-pointer py-3 border-b border-border transition-colors flex justify-between items-center group ${activeCategory === cat ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"}`}
                  onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                >
                  <span>{cat.toUpperCase()}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === cat ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Popular News */}
          <FadeIn direction="up" delay={0.3}>
            <h4 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider pb-2 border-b-2 border-primary inline-block">Berita Terbaru</h4>
            <div className="flex flex-col gap-6">
              {popularItems.map((item) => (
                <Link href={`/berita/${item.id}`} key={`pop-${item.id}`} className="group flex gap-4 items-start">
                  <div className="w-24 h-24 relative overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="96px" />
                  </div>
                  <div className="flex flex-col">
                    <h5 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h5>
                    <span className="text-xs text-muted-foreground font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {item.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
          
        </div>
      </div>
    </div>
  );
}
