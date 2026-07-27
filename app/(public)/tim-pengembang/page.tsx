import { PageHeader } from "@/components/public/common/page-header";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tim Pengembang — Bintang Pertiwi",
  description: "Profil pengembang dan tim di balik pembuatan platform UMKM Bintang Pertiwi.",
};

type DeveloperSection = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageClassName?: string;
  contactLink?: string;
  contactLabel?: string;
};

const sections: DeveloperSection[] = [
  {
    id: "developer",
    title: "Ifnu Umar (Developer)",
    description: "Pengembang utama yang merancang dan membangun ekosistem platform bintangpertiwi.com. Berfokus pada penyediaan sistem yang cepat, stabil, dan mudah digunakan (user-friendly), sehingga para pelaku UMKM dapat mengelola katalog produk mereka secara mandiri dan efisien.",
    image: "/images/ifnunobg.webp",
    imageClassName: "object-contain object-bottom pt-4 px-4 pb-0",
    contactLink: "https://wa.me/6289501603099",
    contactLabel: "Hubungi via WhatsApp",
  },
  {
    id: "kkn",
    title: "Tim KKN 4 Bina Desa",
    description: "Kelompok mahasiswa Kuliah Kerja Nyata (KKN) 4 Bina Desa yang berdedikasi dalam melaksanakan program pengabdian masyarakat. Kehadiran dan antusiasme mereka turut mengiringi langkah awal digitalisasi potensi UMKM di wilayah Bintang Pertiwi.",
    image: "/images/fotokelompok.webp",
    imageClassName: "object-contain object-bottom pt-4 px-4 pb-0",
  },
];

export default function TimPengembangPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <PageHeader
        title="Tim Pengembang"
        description="Di balik pembuatan website wadah kolaborasi dan katalog produk kelompok UMKM Bintang Pertiwi."
      />
      
      <div className="py-24 md:py-32 w-full max-w-7xl mx-auto px-6 flex flex-col gap-24 md:gap-32 overflow-hidden">
        {/* Zigzag Sections */}
        {sections.map((section, index) => {
          const isImageLeft = index % 2 === 0;
          return (
            <div
              key={section.id}
              className={`flex flex-col ${
                isImageLeft ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-12 md:gap-20`}
            >
              {/* Image Side */}
              <FadeIn
                direction="up"
                className="w-full md:w-1/2"
              >
                <div 
                  className={`relative aspect-video md:aspect-4/3 w-full bg-slate-50 ${
                    isImageLeft 
                      ? "shadow-[16px_16px_0_0_#a5e00a] md:shadow-[24px_24px_0_0_#a5e00a]" 
                      : "shadow-[-16px_16px_0_0_#a5e00a] md:shadow-[-24px_24px_0_0_#a5e00a]"
                  }`}
                >
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className={section.imageClassName || "object-cover"}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </FadeIn>

              {/* Text Side */}
              <FadeIn
                direction="up"
                delay={0.2}
                className="w-full md:w-1/2 flex flex-col items-start"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {section.title}
                </h2>
                <div className="w-40 h-1.5 bg-primary mb-6 rounded-full"></div>
                <p className={`text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap ${section.contactLink ? 'mb-8' : ''}`}>
                  {section.description}
                </p>
                {section.contactLink && section.contactLabel && (
                  <a href={section.contactLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="rounded-none font-semibold text-base px-8 h-12">
                      {section.contactLabel}
                    </Button>
                  </a>
                )}
              </FadeIn>
            </div>
          );
        })}
      </div>
    </div>
  );
}
