"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface GaleriSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

interface GaleriSectionProps {
  initialSlides: GaleriSlide[];
}

export function GaleriSection({ initialSlides }: GaleriSectionProps) {
  // Multiply slides for smooth infinite loop feeling
  const slides = [
    ...initialSlides,
    ...initialSlides.map((s) => ({ ...s, id: s.id + "-copy" })),
  ];

  const extendedSlides = [
    ...slides,
    ...slides,
    ...slides,
    ...slides,
    ...slides,
  ].map((s, i) => ({ ...s, uniqueIndex: i }));

  const [currentIndex, setCurrentIndex] = useState(slides.length * 2);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const currentSlide = currentIndex % slides.length;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentIndex >= slides.length * 3) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex - slides.length);
      }, 700);
    } else if (currentIndex < slides.length * 2) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(currentIndex + slides.length);
      }, 700);
    }
    return () => clearTimeout(timeout);
  }, [currentIndex, slides.length]);

  useEffect(() => {
    let frame1: number;
    let frame2: number;

    const el = document.getElementById("galeri-progress-bar");
    if (el) {
      el.style.transition = "none";
      el.style.width = "0%";

      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          el.style.transition = "width 6000ms linear";
          el.style.width = "100%";
        });
      });
    }

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 6000);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [currentSlide]);

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };
  
  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  return (
    <section id="galeri" className="relative h-screen w-full overflow-hidden flex items-center bg-black">
      {/* Background Images Crossfade */}
      {slides.length > 0 && slides.map((slide, index) => (
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
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
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ))}

      {/* Section Indicator Badge */}
      <div className="absolute top-28 md:top-36 left-0 w-full z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div className="inline-flex flex-col gap-3">
              <h2 className="text-white/90 text-sm md:text-base font-bold tracking-[0.3em] uppercase">
                Galeri
              </h2>
              <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary rounded-full"></div>
            </div>
            <Link href="/galeri" className="pointer-events-auto group mt-6 md:mt-0 inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors drop-shadow-md">
              Lihat Semua Galeri <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
        <div className="grid md:grid-cols-2 gap-8 items-center h-full pt-20 md:pt-0">
          
          {/* Left Side: Title & Description */}
          <FadeIn direction="up" delay={0.2} className="flex flex-col text-white relative min-h-[300px] justify-center mt-32 md:mt-0">
            {slides.length > 0 && slides.map((slide, index) => (
              <div
                key={`text-${slide.id}`}
                className={`transition-all duration-700 absolute inset-x-0 top-1/2 -translate-y-1/2 ${
                  index === currentSlide
                    ? "opacity-100 mt-0 pointer-events-auto"
                    : "opacity-0 mt-8 pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-sm md:text-base font-medium text-white/90 uppercase tracking-widest">
                    {slide.subtitle}
                  </p>
                </div>
                <h2 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold uppercase tracking-tighter mb-6 leading-[1.1] drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-base lg:text-lg text-white/80 max-w-md leading-relaxed">
                  {slide.description}
                </p>
              </div>
            ))}
          </FadeIn>

          {/* Right Side: Cards Carousel & Controls */}
          <div className="flex flex-col justify-end items-end h-full pb-8 md:pb-16 w-full overflow-hidden pointer-events-none md:pointer-events-auto">
            
            {/* Cards Carousel (Hidden on mobile) */}
            <div className="hidden md:block w-full pointer-events-auto">
              <div 
                className={`flex items-end gap-5 pl-2 py-4 ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
                style={{ transform: `translateX(calc(-${currentIndex * 180}px))` }}
              >
                {extendedSlides.length > 0 && extendedSlides.map((slide, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <div
                      key={`card-${slide.uniqueIndex}`}
                      onClick={() => {
                        setIsTransitioning(true);
                        setCurrentIndex(index);
                      }}
                      className={`relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 ease-out group shrink-0 ${
                        isActive 
                          ? "w-56 h-[340px] shadow-2xl ring-2 ring-white/30" 
                          : "w-40 h-[260px] shadow-lg opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        sizes="(max-width: 768px) 30vw, 15vw"
                        className={`object-cover transition-transform duration-1000 ${
                          isActive ? "scale-100" : "scale-110 group-hover:scale-105"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      
                      {/* Card Content */}
                      <div className={`absolute bottom-0 left-0 p-5 w-full transition-all duration-500 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100"
                      }`}>
                        <p className="text-white/70 text-xs mb-1.5 line-clamp-1">{slide.subtitle}</p>
                        <h3 className={`text-white font-bold leading-snug ${isActive ? "text-xl" : "text-sm"} line-clamp-2`}>
                          {slide.title}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls (Absolute bottom on mobile, static on desktop) */}
            <div className="absolute bottom-8 left-6 right-6 md:static md:bottom-auto md:left-auto md:right-auto flex items-center mt-auto md:mt-12 md:w-full md:pl-2 pointer-events-auto">
              <div className="text-white font-bold flex items-baseline shrink-0">
                <span className="text-4xl md:text-5xl tracking-tighter">{(currentSlide + 1).toString().padStart(2, '0')}</span>
                <span className="text-white/40 text-xl md:text-2xl font-medium ml-1">/ {slides.length.toString().padStart(2, '0')}</span>
              </div>
              
              <div className="flex-1 h-1 bg-white/20 relative rounded-full overflow-hidden mx-4 md:mx-6">
                <div 
                  id="galeri-progress-bar"
                  className="absolute top-0 left-0 h-full bg-primary"
                  style={{ width: "0%" }}
                />
              </div>
              
              <div className="flex gap-2 md:gap-3 shrink-0 ml-auto">
                <button 
                  onClick={handlePrev}
                  className="h-10 w-10 cursor-pointer md:h-12 md:w-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black text-white transition-all bg-black/20 backdrop-blur-sm"
                >
                   <ArrowLeft size={18} strokeWidth={2} className="md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={handleNext}
                  className="h-10 w-10 cursor-pointer md:h-12 md:w-12 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black text-white transition-all bg-black/20 backdrop-blur-sm"
                >
                   <ArrowRight size={18} strokeWidth={2} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
