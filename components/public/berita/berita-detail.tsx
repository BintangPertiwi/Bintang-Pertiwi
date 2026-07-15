"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Share2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BeritaDetailProps {
  berita: {
    id: string;
    title: string;
    date: string;
    image: string;
    category: string;
    content: string;
  };
}

export function BeritaDetail({ berita }: BeritaDetailProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.getElementById("berita-content");
    if (!article) return;

    const elements = Array.from(article.querySelectorAll("h2, h3"));
    const headingData = elements.map((el, index) => {

      if (!el.id) {
        el.id = `heading-${index}`;
      }
      return {
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      };
    });
    
    setTimeout(() => {
      setHeadings(headingData);
    }, 0);

    const handleScroll = () => {
      const currentElements = Array.from(document.querySelectorAll("#berita-content h2, #berita-content h3"));
      if (currentElements.length === 0 || headingData.length === 0) return;

      let activeIndex = -1;
      let minDistance = Number.POSITIVE_INFINITY;
      const OFFSET = 200;

      for (let i = 0; i < currentElements.length; i++) {
        const rect = currentElements[i].getBoundingClientRect();
        const distance = OFFSET - rect.top;
        if (distance >= 0 && distance < minDistance) {
          minDistance = distance;
          activeIndex = i;
        }
      }

      if (activeIndex === -1 && currentElements.length > 0) {
        activeIndex = 0;
      }
      const currentId = activeIndex !== -1 && headingData[activeIndex] ? headingData[activeIndex].id : "";
      
      setActiveId((prev) => (prev !== currentId ? currentId : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [berita.content]);

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Tautan berhasil disalin!");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: berita.title,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Gagal membagikan:", err);
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end pt-28 md:pt-32">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
          <Image 
            src={berita.image}
            alt={berita.title}
            fill
            className="object-cover relative z-10 transition-opacity duration-700"
            priority
          />
          <div className="absolute inset-0 z-20 bg-black/40" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20">
          <Link href="/berita" className="inline-flex items-center text-slate-300 hover:text-white transition-colors mb-6 md:mb-10 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Berita
          </Link>
          
          <FadeIn direction="up">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-primary text-slate-900 text-sm font-bold uppercase tracking-wider">
                {berita.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 max-w-5xl">
              {berita.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-medium">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                {berita.date}
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2 text-primary" />
                Admin
              </span>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative">
          
          {/* Left Sidebar (Table of Contents) - Sticky on Desktop */}
          <div className="w-full lg:w-[25%] order-1 lg:sticky lg:top-32 self-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider pb-2 border-b-4 border-primary inline-block">
                Daftar Isi
              </h3>
              {headings.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {headings.map((heading) => (
                    <li 
                      key={heading.id} 
                      className={`transition-colors ${heading.level === 3 ? "pl-4" : ""} ${activeId === heading.id ? "border-l-2 border-primary pl-3 text-primary font-bold" : "border-l-2 border-transparent text-slate-600 hover:text-primary"}`}
                    >
                      <a 
                        href={`#${heading.id}`}
                        onClick={(e) => scrollToHeading(e, heading.id)}
                        className="block py-1 leading-snug"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm italic">Tidak ada daftar isi.</p>
              )}
            </div>

            <div className="mt-12">
              <Button
                onClick={handleShare}
                className={'w-full rounded-none'}
              >
                <Share2 className="w-4 h-4" />
                Bagikan Artikel
              </Button>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="w-full lg:w-[75%] order-2">
            <article 
              id="berita-content"
              className="prose prose-lg prose-slate max-w-none 
                         prose-headings:font-bold prose-headings:text-slate-900 
                         prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                         prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                         prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-img:my-8 prose-img:border prose-img:border-slate-200
                         prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-li:mb-2
                         prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600"
              dangerouslySetInnerHTML={{ __html: berita.content }}
            />
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
