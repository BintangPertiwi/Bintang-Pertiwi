"use client";

import { Button } from "@/components/ui/button";
import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Produk UMKM", href: "/produk-umkm" },
  { label: "Berita", href: "/berita" },
  { label: "Galeri", href: "/galeri" },
  { label: "Peta", href: "/peta" },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      let isOverTransparentSection = false;
      const galeriEl = document.getElementById("galeri");
      
      if (galeriEl) {
        const rect = galeriEl.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom >= 80) {
          isOverTransparentSection = true;
        }
      }

      if (window.scrollY > 50 && !isOverTransparentSection) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const safePathname = pathname || "/";
  const isHomePage = safePathname === "/";
  
  const useDarkTheme = !isHomePage || isScrolled;

  return (
    <>
      <nav
        key={mounted ? "nav-client" : "nav-server"}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b-[0.5px] ${
          useDarkTheme
            ? "bg-white/90 backdrop-blur-md border-black/10"
            : "bg-transparent border-white/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className={`font-bold text-xl transition-colors duration-300 ${
              useDarkTheme ? "text-[#0D0D0D]" : "text-white"
            }`}
          >
            Bintang Pertiwi
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = item.href === "/" 
                ? safePathname === item.href 
                : safePathname.startsWith(item.href);
                
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative text-sm font-medium transition-colors ${
                    useDarkTheme ? "text-slate-700 hover:text-primary" : "text-white/90 hover:text-white"
                  } after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-current after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 ${
                    isActive ? "after:origin-bottom-left after:scale-x-100" : "after:origin-bottom-right after:scale-x-0"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/pengaduan">
              <Button
                variant={useDarkTheme ? "default" : "secondary"}
                className={`font-semibold rounded-none px-5 ${!useDarkTheme ? "border border-primary bg-transparent text-primary hover:bg-white/90" : "shadow-md shadow-primary/20"}`}
              >
                Lapor
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                className={`font-semibold rounded-none px-4 gap-2 ${useDarkTheme ? "text-slate-700 hover:text-primary" : "text-white/90 hover:text-white hover:bg-white/10"}`}
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </Button>
            </Link>
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`transition-colors ${
                useDarkTheme ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/20"
              }`}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        key={mounted ? "mobile-client" : "mobile-server"}
        className={`fixed inset-0 z-50 bg-white transition-transform duration-500 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 shrink-0">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-bold text-xl text-[#0D0D0D]"
          >
            Bintang Pertiwi
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-900 hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-col px-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/" 
              ? safePathname === item.href 
              : safePathname.startsWith(item.href);
              
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-4xl py-10 border-b border-slate-200/60 last:border-0 font-bold tracking-tight transition-colors ${
                  isActive ? "text-primary" : "text-slate-900 hover:text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/pengaduan"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-4xl py-10 border-b border-slate-200/60 font-bold tracking-tight transition-colors ${
              safePathname.startsWith("/pengaduan") ? "text-primary" : "text-slate-900 hover:text-slate-600"
            }`}
          >
            Lapor
          </Link>
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-4xl py-10 border-b border-slate-200/60 last:border-0 font-bold tracking-tight transition-colors flex items-center gap-4 ${
              safePathname.startsWith("/login") ? "text-primary" : "text-slate-900 hover:text-slate-600"
            }`}
          >
            Masuk
          </Link>
        </div>
      </div>
    </>
  );
}
