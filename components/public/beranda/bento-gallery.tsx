"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  category?: string;
}

interface BentoGalleryProps {
  items: GalleryItem[];
}

export function BentoGallery({ items }: BentoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const showNext = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }
  }, [selectedIndex, items.length]);

  const showPrev = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    }
  }, [selectedIndex, items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showNext, showPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    
    if (distance > 50) showNext();
    if (distance < -50) showPrev();
    
    setTouchStart(null);
  };

  if (!items || items.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">Belum ada galeri.</div>;
  }

  const getBentoClasses = (index: number) => {
    const pattern = index % 7;
    switch (pattern) {
      case 0:
        return "col-span-2 row-span-2 md:col-span-2 md:row-span-2";
      case 1:
        return "col-span-1 row-span-1 md:col-span-1 md:row-span-1";
      case 2:
        return "col-span-1 row-span-1 md:col-span-1 md:row-span-1";
      case 3:
        return "col-span-1 row-span-2 md:col-span-1 md:row-span-2";
      case 4:
        return "col-span-1 row-span-1 md:col-span-1 md:row-span-1";
      case 5:
        return "col-span-2 row-span-1 md:col-span-2 md:row-span-1";
      case 6:
        return "col-span-1 row-span-1 md:col-span-1 md:row-span-1";
      default:
        return "col-span-1 row-span-1";
    }
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 grid-flow-row-dense auto-rows-[150px] md:auto-rows-[250px]">
          {items.map((item, index) => (
            <FadeIn 
              key={`${item.id}-${index}`}
              direction="none"
              delay={0.05 * (index % 7)}
              className={`relative bg-muted overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${getBentoClasses(index)}`}
            >
              <div 
                className="absolute inset-0 cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover relative z-10 transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                  priority={index < 6}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                  <span className="text-primary text-xs font-bold tracking-widest uppercase mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {item.category || "Galeri"}
                  </span>
                  <h4 className="text-white text-lg md:text-xl font-bold truncate transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {item.title}
                  </h4>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          >
          
          {/* Top Bar (Title & Close) */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-center z-50 bg-gradient-to-b from-black/80 to-transparent">
            <h3 className="text-white text-lg md:text-2xl font-bold tracking-wide drop-shadow-md truncate px-12 mt-4">
              {items[selectedIndex].title || "Tanpa Judul"}
            </h3>
            <button 
              onClick={closeLightbox}
              className="absolute right-4 md:right-6 text-white hover:text-primary transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full mt-4 cursor-pointer"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>

          {/* Navigation Prev */}
          <button 
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            className="absolute left-2 md:left-6 text-white hover:text-primary p-2 md:p-3 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 md:w-10 md:h-10" />
          </button>

          {/* Navigation Next */}
          <button 
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            className="absolute right-2 md:right-6 text-white hover:text-primary p-2 md:p-3 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-50 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 md:w-10 md:h-10" />
          </button>

          {/* Main Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={closeLightbox}
          >
            <div 
              className="relative w-full max-w-4xl h-[80vh] md:h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={items[selectedIndex].image}
                alt={items[selectedIndex].title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
          
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
