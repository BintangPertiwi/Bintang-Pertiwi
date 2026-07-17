"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Calendar, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export interface NewsItem {
  id: string;
  judul: string;
  tanggal: string;
  ringkasan: string;
  isi_berita: string;
  url_foto: string;
  kategori: string;
}

interface NewsSectionProps {
  initialNews?: NewsItem[];
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function NewsSection({ initialNews = [] }: NewsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!initialNews || initialNews.length === 0) {
    return (
      <section className="bg-background py-24 md:py-32 relative">
        <div className="w-full max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex flex-col gap-3 mb-6 items-center">
            <h2 className="text-foreground text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Berita & Informasi
            </h2>
            <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary rounded-full"></div>
          </div>
          <p className="text-muted-foreground mt-4">Belum ada berita yang tersedia saat ini.</p>
        </div>
      </section>
    );
  }

  const activeNews = initialNews[activeIndex];

  const paginate = (newDirection: number) => {
    let newIndex = activeIndex + newDirection;
    if (newIndex < 0) newIndex = initialNews.length - 1;
    if (newIndex >= initialNews.length) newIndex = 0;
    setActiveIndex(newIndex);
  };

  return (
    <section className="bg-background py-24 md:py-32 relative">
      {/* Background Pattern Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "linear-gradient(to right, var(--pattern-dot) 1px, transparent 1px), linear-gradient(to bottom, var(--pattern-dot) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        }}
      />
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header - Mengikuti style About Section */}
        <FadeIn direction="up" className="mb-10 md:mb-14 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div className="inline-flex flex-col gap-3">
            <h2 className="text-foreground text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Berita & Informasi
            </h2>
            <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary rounded-full"></div>
          </div>
          <Link href="/berita" className="group hidden md:inline-flex mt-6 md:mt-0 items-center text-primary font-bold hover:text-primary/80 transition-colors">
            Lihat Semua Berita <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeIn>

        {/* Layout Grid Asimetris sesuai referensi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* KIRI: Featured News (Kotak, gambar full, overlay hitam di bawah) */}
          <FadeIn direction="up" delay={0.2} className="lg:col-span-7 relative min-h-[400px] lg:h-auto w-full overflow-hidden group">
            <AnimatePresence initial={false}>
              <motion.div
                key={activeIndex}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Background Image - Kotak tanpa border radius */}
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                <Image
                  src={activeNews.url_foto}
                  alt={activeNews.judul}
                  fill
                  className="object-cover relative z-10 transition-opacity duration-500"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                
                {/* Gradient Overlay dari referensi (gelap di bawah) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Konten Text di bawah */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pointer-events-none">
                  <div className="inline-block px-2.5 py-1 bg-primary text-foreground text-[10px] font-bold uppercase tracking-wider mb-3">
                    {activeNews.kategori}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {activeNews.judul}
                  </h3>
                  
                  <div className="flex items-center text-muted-foreground text-[11px] font-bold uppercase tracking-wider gap-4 mb-6">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {activeNews.tanggal}</span>
                  </div>

                  <Link 
                    href={`/berita/${activeNews.id}`}
                    className="pointer-events-auto inline-flex items-center text-white font-bold hover:text-primary hover:gap-2 transition-all"
                  >
                    BACA SELENGKAPNYA <ChevronRight className="w-5 h-5 ml-1 text-primary" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav Arrows */}
            <button 
              onClick={() => paginate(-1)}
              className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </FadeIn>

          {/* KANAN: List Berita (Tanpa border/shadow, clean list) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:pl-4">
            {initialNews.map((news, idx) => {
              return (
                <FadeIn 
                  key={news.id} 
                  direction="up" 
                  delay={Math.min(idx * 0.05, 0.2)}
                  className="flex-1"
                >
                  <div 
                    className={cn(
                      "group flex gap-4 items-start cursor-pointer transition-all flex-1",
                      activeIndex === idx ? "pointer-events-none" : "hover:opacity-90"
                    )}
                    onClick={() => setActiveIndex(idx)}
                  >
                  {/* Thumbnail Image - Persegi panjang / Landscape, Kotak */}
                  <div className="relative w-36 h-24 md:w-48 md:h-32 overflow-hidden flex-shrink-0 bg-muted group">
                    <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                    <Image
                      src={news.url_foto}
                      alt={news.judul}
                      fill
                      className="object-cover relative z-10 transition-all duration-500 group-hover:scale-105"
                      sizes="192px"
                    />
                  </div>

                  {/* Content Right Side */}
                  <div className="flex flex-col py-0">
                    <div className="mb-2">
                      <span className="inline-block px-2.5 py-1 bg-primary text-foreground text-[10px] font-bold uppercase tracking-wider">
                        {news.kategori}
                      </span>
                    </div>
                    <Link 
                      href={`/berita/${news.id}`}
                      className={cn(
                        "text-base md:text-lg font-bold leading-snug line-clamp-2 mb-2 transition-colors pointer-events-auto",
                        activeIndex === idx ? "text-primary" : "text-foreground hover:text-primary"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {news.judul}
                    </Link>
                    <div className="flex items-center text-[10px] font-bold uppercase text-muted-foreground gap-3 tracking-wider">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {news.tanggal}</span>
                    </div>
                  </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

        </div>

        {/* Mobile View All Link */}
        <div className="mt-10 flex md:hidden justify-start">
          <Link href="/berita" className="group inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors">
            Lihat Semua Berita <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
