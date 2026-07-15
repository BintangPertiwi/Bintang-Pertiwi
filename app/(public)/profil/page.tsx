import { PageHeader } from "@/components/public/common/page-header";
import { FadeIn } from "@/components/ui/fade-in";
import { getGlobalConfig } from "@/lib/db/queries";
import Image from "next/image";

export const metadata = {
  title: "Profil — Bintang Pertiwi",
  description: "Profil, sejarah, dan potensi Bintang Pertiwi.",
};

const profileSections = [
  {
    id: "sejarah",
    title: "Sejarah & Perkembangan",
    description:
      "Awal mula masyarakat mulai menetap dan membuka lahan di wilayah Bintang Pertiwi, menjadikannya pemukiman yang rukun dan berkembang secara mandiri. Seiring berjalannya waktu, semangat gotong royong warga telah membangun berbagai fasilitas umum yang memperkuat ikatan sosial masyarakat.",
    image: "/images/hero_bg_desa.png",
    imageLeft: true,
  },
  {
    id: "geografis",
    title: "Kondisi Geografis & Lingkungan",
    description:
      "Bintang Pertiwi terletak di dataran tinggi dengan iklim yang sejuk dan menyegarkan. Kondisi alamnya yang asri dan kualitas tanah yang subur sangat mendukung sektor agraris. Lingkungan yang masih terjaga keasriannya menjadikan tempat ini sebagai paru-paru hijau di wilayah sekitarnya.",
    image: "/images/hero_bg_desa_2.png",
    imageLeft: false,
  },
  {
    id: "potensi",
    title: "Potensi & Sumber Daya",
    description:
      "Kawasan ini perlahan bertransformasi menjadi sentra pertanian organik dan destinasi ekowisata. Sebagian besar warga berprofesi sebagai petani yang menjunjung tinggi pelestarian alam, menghasilkan panen berkualitas tinggi sekaligus memelihara keseimbangan ekosistem lokal.",
    image: "/images/hero_bg_desa_3.png",
    imageLeft: true,
  },
];

export default async function ProfilPage() {
  const globalConfig = await getGlobalConfig();

  let sections = profileSections;
  try {
    if (globalConfig["profil_sections"]) {
      const parsed = JSON.parse(globalConfig["profil_sections"]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sections = parsed;
      }
    }
  } catch {}

  const visi = globalConfig["profil_visi"] || "Menjadikan Bintang Pertiwi sebagai pelopor mandiri, sejahtera, berwawasan lingkungan, dan berpegang teguh pada nilai adat istiadat.";
  
  let misiList = [
    "Meningkatkan kualitas SDM melalui pendidikan dan penyuluhan.",
    "Mendorong pengembangan sektor pertanian organik secara masif.",
    "Menjaga kelestarian alam sebagai aset ekowisata utama.",
    "Memperkuat budaya gotong royong dan kebersamaan warga."
  ];

  try {
    if (globalConfig["profil_misi"]) {
      const parsed = JSON.parse(globalConfig["profil_misi"]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        misiList = parsed;
      }
    }
  } catch {}

  const headerTitle = globalConfig["profil_header_title"] || "Profil";
  const headerDesc = globalConfig["profil_header_desc"] || "Mengenal lebih dekat sejarah, kondisi alam, dan potensi yang dimiliki oleh Bintang Pertiwi.";

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      <PageHeader
        title={headerTitle}
        description={headerDesc}
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
                className={`relative aspect-video md:aspect-4/3 w-full ${
                  isImageLeft 
                    ? "shadow-[16px_16px_0_0_#a5e00a] md:shadow-[24px_24px_0_0_#a5e00a]" 
                    : "shadow-[-16px_16px_0_0_#a5e00a] md:shadow-[-24px_24px_0_0_#a5e00a]"
                }`}
              >
                <Image
                  src={section.image || "/images/hero_bg_desa.png"}
                  alt={section.title}
                  fill
                  className="object-cover rounded-none"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </FadeIn>

            {/* Text Side */}
            <FadeIn
              direction="up"
              delay={0.2}
              className="w-full md:w-1/2 flex flex-col"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                {section.title}
              </h2>
              <div className="w-40 h-1.5 bg-primary mb-6 rounded-full"></div>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                {section.description}
              </p>
            </FadeIn>
          </div>
        )})}
      </div>

      {/* Visi Misi Section */}
      <div className="relative w-full bg-white border-y border-slate-200 overflow-hidden">
        {/* Pattern Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at center, #000000 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col">
          
          {/* Row 1: VISI */}
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200">
            {/* Title */}
            <div className="w-full md:w-1/3 lg:w-1/4 p-12 md:p-16 flex items-center justify-center md:justify-end bg-white/80">
              <FadeIn direction="up">
                <h3 className="text-4xl font-bold text-slate-900 tracking-widest uppercase">
                  Visi
                </h3>
              </FadeIn>
            </div>
            {/* Content */}
            <div className="w-full md:w-2/3 lg:w-3/4 p-12 md:p-16 lg:p-24 flex items-center bg-white/80">
              <FadeIn direction="up" delay={0.2}>
                <p className="text-slate-600 text-xl md:text-2xl leading-relaxed max-w-2xl font-medium whitespace-pre-wrap">
                  {visi}
                </p>
              </FadeIn>
            </div>
          </div>

          {/* Row 2: MISI */}
          <div className="flex flex-col md:flex-row-reverse divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200">
            {/* Title */}
            <div className="w-full md:w-1/3 lg:w-1/4 p-12 md:p-16 flex items-center justify-center md:justify-start bg-white/80">
              <FadeIn direction="up">
                <h3 className="text-4xl font-bold text-slate-900 tracking-widest uppercase">
                  Misi
                </h3>
              </FadeIn>
            </div>
            {/* Content */}
            <div className="w-full md:w-2/3 lg:w-3/4 p-12 md:p-16 lg:p-24 flex items-center justify-end text-left bg-white/80">
              <div className="w-full max-w-2xl flex flex-col gap-6">
                {misiList.map((item, idx) => (
                  <FadeIn 
                    key={idx} 
                    direction="up" 
                    delay={0.2 + (idx * 0.05)} 
                    className="flex items-start gap-4"
                  >
                    <span className="text-primary font-bold text-xl font-mono shrink-0 pt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <p className="text-slate-600 text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                      {item}
                    </p>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
