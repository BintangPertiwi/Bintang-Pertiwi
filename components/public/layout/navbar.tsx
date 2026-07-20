"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Produk UMKM", href: "/produk-umkm" },
  { label: "Berita", href: "/berita" },
  { label: "Galeri", href: "/galeri" },
  { label: "Dokumen", href: "/dokumen" },
  { label: "Kontak", href: "/kontak" },
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
  
  const isSolid = !isHomePage || isScrolled;

  return (
    <>
      <nav
        key={mounted ? "nav-client" : "nav-server"}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b-[0.5px] ${
          isSolid
            ? "bg-background/90 backdrop-blur-md border-border"
            : "bg-transparent border-white/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className={`flex items-center gap-2 font-bold text-xl transition-colors duration-300 ${
              isSolid ? "text-foreground" : "text-white"
            }`}
          >
            <Image src="/icon.png" alt="Logo" width={32} height={32} className="rounded-full" />
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
                    isSolid ? "text-foreground hover:text-primary" : "text-white/90 hover:text-white"
                  } after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-current after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 ${
                    isActive ? "after:origin-bottom-left after:scale-x-100" : "after:origin-bottom-right after:scale-x-0"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/login">
              <Button
                variant="ghost"
                className={`font-semibold rounded-none px-4 gap-2 ${isSolid ? "text-foreground hover:text-primary" : "text-white/90 hover:text-white hover:bg-white/10"}`}
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </Button>
            </Link>
            <ThemeToggle className={isSolid ? undefined : "text-white hover:text-white hover:bg-white/10"} />
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle className={isSolid ? undefined : "text-white hover:text-white hover:bg-white/20"} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`transition-colors ${
                isSolid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/20"
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
        className={`fixed inset-0 z-50 bg-background transition-transform duration-500 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-border shrink-0">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 font-bold text-xl text-foreground"
          >
            <Image src="/icon.png" alt="Logo" width={28} height={28} className="rounded-full" />
            Bintang Pertiwi
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-foreground hover:bg-muted"
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
                className={`text-4xl py-10 border-b border-border/60 last:border-0 font-bold tracking-tight transition-colors ${
                  isActive ? "text-primary" : "text-foreground hover:text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`text-4xl py-10 border-b border-border/60 last:border-0 font-bold tracking-tight transition-colors flex items-center gap-4 ${
              safePathname.startsWith("/login") ? "text-primary" : "text-foreground hover:text-muted-foreground"
            }`}
          >
            Masuk
          </Link>
        </div>
      </div>
    </>
  );
}
