"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FadeIn } from "@/components/ui/fade-in";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProdukCardSkeleton } from "@/components/ui/skeletons/produk-card-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import type { ProdukRow } from "@/types";
import { MessageCircle, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface ProdukLayoutProps {
  products: ProdukRow[];
  categories: string[];
}

const INITIAL_VISIBLE = 15;
const LOAD_STEP = 15;

export function ProdukLayout({ products, categories }: ProdukLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return products.filter((product) => {
      const matchesSearch = product.nama.toLowerCase().includes(query);
      const matchesCategory = activeCategory === "Semua" || product.kategori === activeCategory;
      const matchesStock = inStockOnly ? product.stok === "Tersedia" : true;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, debouncedSearch, activeCategory, inStockOnly]);

  const filterKey = `${debouncedSearch}|${activeCategory}|${inStockOnly}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(INITIAL_VISIBLE);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_STEP, filteredProducts.length));
        }
      },
      { threshold: 0.1, rootMargin: "400px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => observer.disconnect();
  }, [filteredProducts.length]);

  const visibleItems = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;
  const isSearching = searchQuery.length > 0 || activeCategory !== "Semua" || inStockOnly;

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("Semua");
    setInStockOnly(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left Sidebar (Filters) */}
        <div className="w-full lg:w-[25%] flex flex-col gap-8 shrink-0 lg:sticky lg:top-28 lg:self-start">
          <FadeIn direction="up">
            <h4 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider pb-2 border-b-4 border-primary inline-block">Cari Produk</h4>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 h-12 bg-white shadow-sm border-slate-200"
              />
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <h4 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider pb-2 border-b-4 border-primary inline-block">Kategori</h4>
            <ul className="flex flex-col gap-3">
              {categories.map((cat) => (
                <li key={cat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={activeCategory === cat}
                    onCheckedChange={() => setActiveCategory(cat)}
                  />
                  <Label htmlFor={`cat-${cat}`} className="text-slate-600 font-medium cursor-pointer">
                    {cat}
                  </Label>
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <h4 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider pb-2 border-b-4 border-primary inline-block">Ketersediaan</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={inStockOnly}
                onCheckedChange={(checked) => setInStockOnly(checked === true)}
              />
              <Label htmlFor="in-stock" className="text-slate-600 font-medium cursor-pointer">
                Hanya Stok Tersedia
              </Label>
            </div>
          </FadeIn>

          {isSearching && (
            <FadeIn direction="up" delay={0.3}>
              <Button variant="outline" className="w-full justify-center" onClick={resetFilters}>
                Reset Filter
                <X className="w-4 h-4 ml-2" />
              </Button>
            </FadeIn>
          )}
        </div>

        {/* Right Column (Product Grid) */}
        <div className="w-full lg:flex-1">
          <div className="mb-6 flex justify-between items-end pb-4 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Menampilkan {filteredProducts.length} produk</span>
          </div>

          {visibleItems.length > 0 ? (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                {visibleItems.map((item, index) => (
                  <FadeIn key={item.id} direction="up" delay={Math.min((index % LOAD_STEP) * 0.05, 0.2)}>
                    <Link href={`/produk-umkm/${item.slug}`} className="group block bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative">
                      {/* Image Area */}
                      <div className="aspect-square sm:aspect-[4/3] w-full relative bg-slate-100 overflow-hidden">
                        <Image
                          src={item.gambar_urls[0]}
                          alt={item.nama}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />

                        {item.harga_coret && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm">
                            {Math.round(((item.harga_coret - item.harga) / item.harga_coret) * 100)}% OFF
                          </div>
                        )}

                        {item.stok === "Habis" && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <span className="bg-slate-900 text-white font-bold px-4 py-2 rounded-full uppercase tracking-wider text-sm">
                              HABIS
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-3 sm:p-5 flex flex-col h-[130px] sm:h-[180px]">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <span className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate mr-1">
                            {item.kategori}
                          </span>
                        </div>

                        <h3 className="text-[13px] sm:text-lg font-bold text-slate-900 leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {item.nama}
                        </h3>

                        <div className="mt-auto pt-2 sm:pt-4 flex items-end justify-between">
                          <div className="flex flex-col">
                            {item.harga_coret && (
                              <span className="text-slate-400 text-[10px] sm:text-sm line-through decoration-slate-300 mb-0.5 sm:mb-0">
                                Rp {item.harga_coret.toLocaleString("id-ID")}
                              </span>
                            )}
                            <span className="text-sm sm:text-xl font-bold text-slate-900 leading-none sm:leading-normal">
                              Rp {item.harga.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors shrink-0 shadow-sm">
                            <MessageCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>

              {hasMore && (
                <div ref={observerTarget} className="mt-8 grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                  {Array.from({ length: Math.min(LOAD_STEP, filteredProducts.length - visibleCount) }).map((_, i) => (
                    <ProdukCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center flex flex-col items-center border border-dashed border-slate-200 rounded-2xl">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Produk tidak ditemukan</h3>
              <p className="text-slate-500">Silakan gunakan kata kunci atau filter lain.</p>
              <Button onClick={resetFilters} className="mt-6">
                Reset Semua Filter
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
