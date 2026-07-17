"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  id: string | number;
  image: string;
  title: string;
  linkText: string;
  linkHref: string;
};

const fallbackSlides: Slide[] = [
  {
    id: 1,
    image: "/images/hero_bg_desa.png",
    title: "Membangun Bintang Pertiwi yang Lebih Mandiri dan Sejahtera",
    linkText: "Pelajari Lebih Lanjut",
    linkHref: "#",
  },
  {
    id: 2,
    image: "/images/hero_bg_desa_2.png",
    title: "Panen Raya: Keberhasilan Pertanian Padi Organik di Musim Ini",
    linkText: "Baca Selengkapnya",
    linkHref: "#",
  },
  {
    id: 3,
    image: "/images/hero_bg_desa_3.png",
    title: "Pesona Pagi di Bintang Pertiwi, Destinasi Ekowisata Baru Tahun Ini",
    linkText: "Lihat Galeri",
    linkHref: "#",
  },
];

export function HeroBanner({ initialSlides }: { initialSlides?: Slide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = initialSlides && initialSlides.length > 0 ? initialSlides : fallbackSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Ganti gambar tiap 6 detik
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Crossfade */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Konten Hero & Pagination Container */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 md:pb-24 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-8 pointer-events-auto">
          
          {/* Teks Konten */}
          <FadeIn direction="up" className="w-full max-w-4xl relative min-h-[200px] md:min-h-[280px] flex items-end">
            {slides.map((slide, index) => (
              <div
                key={`text-${slide.id}`}
                className={`transition-all duration-300 absolute bottom-0 left-0 w-full ${
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] text-white font-bold leading-tight mb-8 drop-shadow-md">
                  {slide.title}
                </h1>
                <a
                  href={slide.linkHref}
                  className="inline-flex items-center text-white font-semibold gap-2 group hover:text-white/80 transition-colors"
                >
                  {slide.linkText} 
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            ))}
          </FadeIn>

          {/* Pagination Indicators */}
          <FadeIn direction="up" delay={0.1} className="flex items-center gap-3 shrink-0 mb-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-8 bg-background" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
