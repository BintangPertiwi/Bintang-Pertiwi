"use client";

import { BentoGallery, type GalleryItem } from "@/components/public/beranda/bento-gallery";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PaginatedGalleryProps {
  items: GalleryItem[];
}

export function PaginatedGallery({ items }: PaginatedGalleryProps) {
  const ITEMS_PER_PAGE = 7;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length));
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "400px"
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => observer.disconnect();
  }, [items.length]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <div className="flex flex-col items-center w-full">
      <BentoGallery items={visibleItems} />
      
      {hasMore && (
        <div ref={observerTarget} className="mt-2 mb-20 flex justify-center w-full py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin opacity-50" />
        </div>
      )}
    </div>
  );
}
