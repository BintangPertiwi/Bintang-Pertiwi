"use client";

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface RevenueCarouselProps {
  slides: { title: string; data: { name: string; value: number }[] }[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6', '#f97316'];

export function RevenueCarousel({ slides }: RevenueCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!slides || slides.length === 0) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-transparent">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="flex-[0_0_100%] min-w-0" key={index}>
              <h3 className="text-center font-bold text-foreground mb-4 text-lg tracking-wide uppercase">{slide.title}</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slide.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {slide.data.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: unknown) => [formatCurrency(Number(value)), "Pendapatan"]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={80} 
                      formatter={(value) => <span className="text-sm font-medium text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={scrollPrev} 
            className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-foreground/25 hover:bg-foreground hover:text-background text-foreground transition-all bg-background/40 backdrop-blur-sm z-10 cursor-pointer shadow-none"
            title="Sebelumnya"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <button 
            onClick={scrollNext} 
            className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-foreground/25 hover:bg-foreground hover:text-background text-foreground transition-all bg-background/40 backdrop-blur-sm z-10 cursor-pointer shadow-none"
            title="Selanjutnya"
          >
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === selectedIndex ? 'bg-primary scale-110' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
