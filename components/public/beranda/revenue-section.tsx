import { FadeIn } from "@/components/ui/fade-in";
import { RevenueCarousel } from "./revenue-carousel";
import type { CustomChartSlide } from "@/hooks/admin/use-pengaturan-beranda-form";

interface RevenueSectionProps {
  badge?: string;
  title?: string;
  narasi?: string;
  charts?: CustomChartSlide[];
  fallbackData?: { name: string; value: number }[];
}

export function RevenueSection({ badge, title, narasi, charts, fallbackData }: RevenueSectionProps) {
  // Determine slides to display
  let slidesToDisplay: { title: string; data: { name: string; value: number }[] }[] = [];

  if (charts && charts.length > 0) {
    slidesToDisplay = charts.map((c) => ({
      title: c.title,
      data: c.items.map((it) => ({ name: it.name, value: it.value })),
    }));
  } else if (fallbackData && fallbackData.length > 0) {
    const slide1 = fallbackData.slice(0, 5);
    const slide2 = fallbackData.length > 5 ? fallbackData.slice(5, 10) : [...fallbackData].reverse();
    slidesToDisplay = [
      { title: "Top 5 Pendapatan UMKM", data: slide1 },
      { title: "Produk Unggulan Lainnya", data: slide2 }
    ];
  }

  if (slidesToDisplay.length === 0) return null;

  const defaultBadge = "PENDAPATAN UMKM";
  const defaultTitle = "Kontribusi & Perkembangan Kelompok Binaan";
  const defaultNarasi = "Diagram berikut menyajikan ringkasan pendapatan dari berbagai produk unggulan Kelompok Binaan Program PPM Bintang Pertiwi Pertamina EP Sangatta Field.";

  return (
    <section id="pendapatan-umkm" className="relative bg-background py-16 md:py-24 border-t border-border/40 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--pattern-dot) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />
      
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Title & Description */}
          <div className="lg:col-span-6 space-y-6">
            <FadeIn direction="up">
              <div className="inline-flex flex-col gap-3">
                <h2 className="text-foreground text-sm md:text-base font-bold tracking-[0.3em] uppercase">
                  {badge || defaultBadge}
                </h2>
                <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary rounded-full"></div>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {title || defaultTitle}
              </h3>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {narasi || defaultNarasi}
              </p>
            </FadeIn>
          </div>

          {/* Right Column: The Pie Chart Carousel */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <FadeIn direction="up" delay={0.4} className="w-full">
              <RevenueCarousel slides={slidesToDisplay} />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
