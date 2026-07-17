"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({
  from = 0,
  to,
  duration = 2,
  prefix = "",
  suffix = "",
}: {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const controls = animate(from, to, {
        duration,
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = `${prefix}${Math.round(value).toLocaleString("id-ID")}${suffix}`;
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration, isInView, prefix, suffix]);

  return <span ref={nodeRef}>{`${prefix}${from}${suffix}`}</span>;
}

export function AboutSection({
  narasi,
  nilaiEkonomi = 0,
  mitraBinaan = 0,
  penerimaLangsung = 0,
  penerimaTidakLangsung = 0,
}: {
  narasi?: string;
  nilaiEkonomi?: number;
  mitraBinaan?: number;
  penerimaLangsung?: number;
  penerimaTidakLangsung?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const trailingText = narasi || "Misi kami adalah mewujudkan Bintang Pertiwi yang sejahtera, mandiri, dan berbudaya melalui kolaborasi aktif warga, pemanfaatan potensi alam yang berkelanjutan, serta pelayanan publik yang transparan.";

  // Pisah narasi jadi paragraf pada baris kosong; newline tunggal (antar-item daftar)
  // tetap dijaga lewat `whitespace-pre-line` saat render.
  const paragraphs = trailingText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const paragraphVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="profil" className="relative bg-background py-24 md:py-32 overflow-hidden">
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
        
        <FadeIn direction="up" className="mb-10 md:mb-14 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div className="inline-flex flex-col gap-3">
            <h2 className="text-foreground text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Tentang Kami
            </h2>
            <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary rounded-full"></div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20" ref={ref}>

          <div className="lg:col-span-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-4 md:space-y-5"
            >
              {paragraphs.map((para, index) => (
                <motion.p
                  key={index}
                  variants={paragraphVariants}
                  className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium text-foreground whitespace-pre-line"
                >
                  {para}
                </motion.p>
              ))}
            </motion.div>
          </div>

          <FadeIn direction="up" delay={0.4} className="lg:col-span-4 flex flex-col gap-6 lg:gap-10 lg:border-l lg:border-border lg:pl-16">
            <div className="flex flex-col border-y border-border py-6 lg:border-none lg:py-0">
              <div className="text-3xl md:text-5xl font-bold text-primary mb-2 break-words">
                <Counter to={nilaiEkonomi} prefix="Rp " />
              </div>
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wide">Nilai Ekonomi yang Dihasilkan</div>
            </div>

            <div className="w-16 h-[1px] bg-border hidden lg:block"></div>

            <div className="flex flex-col border-y border-border py-6 lg:border-none lg:py-0">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                <Counter to={mitraBinaan} suffix="+" />
              </div>
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wide">Mitra Kelompok Binaan</div>
            </div>

            <div className="w-16 h-[1px] bg-border hidden lg:block"></div>

            <div className="flex flex-col border-y border-border py-6 lg:border-none lg:py-0">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                <Counter to={penerimaLangsung} suffix="+" />
              </div>
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wide">Penerima Manfaat Langsung</div>
            </div>

            <div className="w-16 h-[1px] bg-border hidden lg:block"></div>

            <div className="flex flex-col border-y border-border py-6 lg:border-none lg:py-0">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                <Counter to={penerimaTidakLangsung} suffix="+" />
              </div>
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wide">Penerima Manfaat Tidak Langsung</div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
