"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { animate, motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

function Counter({ from = 0, to, duration = 2 }: { from?: number; to: number; duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const controls = animate(from, to, {
        duration,
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value).toLocaleString("id-ID");
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration, isInView]);

  return <span ref={nodeRef}>{from}</span>;
}

export function AboutSection({
  narasi,
  totalPenduduk = 1250,
  totalRw = 4,
  totalRt = 12,
}: {
  narasi?: string;
  totalPenduduk?: number;
  totalRw?: number;
  totalRt?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const trailingText = narasi || "Misi kami adalah mewujudkan Bintang Pertiwi yang sejahtera, mandiri, dan berbudaya melalui kolaborasi aktif warga, pemanfaatan potensi alam yang berkelanjutan, serta pelayanan publik yang transparan.";

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { color: "#cbd5e1", opacity: 0.3 },
    visible: {
      color: "#1e293b",
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <section id="profil" className="relative bg-white py-24 md:py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        
        <FadeIn direction="up" className="mb-10 md:mb-14 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div className="inline-flex flex-col gap-3">
            <h2 className="text-slate-800 text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Tentang Kami
            </h2>
            <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary rounded-full"></div>
          </div>
          <Link href="/profil" className="group hidden md:inline-flex mt-6 md:mt-0 items-center text-primary font-bold hover:text-primary/80 transition-colors">
            Baca Selengkapnya <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20" ref={ref}>

          <div className="lg:col-span-8">
            <p className="text-2xl md:text-3xl lg:text-5xl leading-relaxed md:leading-snug lg:leading-snug font-medium text-slate-800 text-justify">
              <motion.span
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              >
                {trailingText.split(" ").map((word, index) => (
                  <span key={index}>
                    <motion.span variants={wordVariants} className="inline-block">
                      {word}
                    </motion.span>
                    {" "}
                  </span>
                ))}
              </motion.span>
            </p>
          </div>

          <FadeIn direction="up" delay={0.4} className="lg:col-span-4 flex flex-col gap-6 lg:gap-10 lg:border-l lg:border-slate-200 lg:pl-16">
            <div className="flex flex-col border-y border-slate-200 py-6 lg:border-none lg:py-0">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                <Counter to={totalPenduduk} />+
              </div>
              <div className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wide">Total Penduduk</div>
            </div>
            
            <div className="w-16 h-[1px] bg-slate-200 hidden lg:block"></div>
            
            <div className="flex flex-col border-y border-slate-200 py-6 lg:border-none lg:py-0">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                <Counter to={totalRw} />
              </div>
              <div className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wide">Rukun Warga (RW)</div>
            </div>
            
            <div className="w-16 h-[1px] bg-slate-200 hidden lg:block"></div>
            
            <div className="flex flex-col border-y border-slate-200 py-6 lg:border-none lg:py-0">
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                <Counter to={totalRt} />
              </div>
              <div className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wide">Rukun Tetangga (RT)</div>
            </div>
          </FadeIn>

        </div>

        {/* Mobile View All Link */}
        <div className="mt-10 flex md:hidden justify-start">
          <Link href="/profil" className="group inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors">
            Baca Selengkapnya <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
