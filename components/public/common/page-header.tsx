import { FadeIn } from "@/components/ui/fade-in";

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="relative w-full pt-28 pb-16 md:pt-32 md:pb-20 bg-background overflow-hidden border-border">
      {/* Pattern Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at center, var(--pattern-dot) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mt-10">
        <FadeIn direction="up">
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-8xl font-bold text-foreground tracking-tight leading-[1.1]">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-foreground leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
