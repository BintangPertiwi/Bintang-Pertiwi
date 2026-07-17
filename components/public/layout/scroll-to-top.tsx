"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollHeight > 0) {
        const percent = Math.min(Math.max((scrollTop / scrollHeight) * 100, 0), 100);
        setProgress(percent);
      } else {
        setProgress(0);
      }

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="Kembali ke Atas"
      className={`
        fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 
        w-11 h-11 md:w-12 md:h-12 rounded-md 
        flex items-center justify-center overflow-hidden
        bg-card
        shadow-[4px_4px_0_0_#a5e00a]
        transition-all duration-300 ease-in-out
        hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_0_#a5e00a]
        active:translate-y-[4px] active:translate-x-[4px] active:shadow-none
        cursor-pointer
        ${isVisible ? "opacity-100" : "opacity-0 translate-y-10 pointer-events-none"}
      `}
    >
      {/* Background Fill Layer */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-primary/20 transition-all duration-75 ease-out"
        style={{ height: `${progress}%` }}
      />
      
      {/* Icon Layer */}
      <ArrowUp className="w-5 h-5 md:w-6 md:h-6 text-primary relative z-10" />
    </button>
  );
}
