import { AboutSection } from "@/components/public/beranda/about-section";
import { GaleriSection } from "@/components/public/galeri/galeri-section";
import { HeroBanner } from "@/components/public/beranda/hero-banner";
import { NewsSection } from "@/components/public/beranda/news-section";
import { getGaleriList, getGlobalConfig, getRecentBerita } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Beranda — Bintang Pertiwi",
  description: "Selamat datang di portal informasi resmi Bintang Pertiwi.",
};

export default async function BerandaPage() {
  const globalConfig = await getGlobalConfig();
  const galeriList = await getGaleriList();
  const beritaList = await getRecentBerita(4);
  
  const selectedGaleriIdsStr = globalConfig["beranda_galeri_ids"];
  let selectedGaleri = galeriList;
  
  if (selectedGaleriIdsStr && selectedGaleriIdsStr.trim() !== "") {
    const ids = selectedGaleriIdsStr.split(",").map(id => id.trim());
    selectedGaleri = ids.map(id => galeriList.find(g => g.id === id)).filter((g): g is NonNullable<typeof g> => g !== undefined);
  }

  if (selectedGaleri.length === 0) {
    selectedGaleri = galeriList.slice(0, 5);
  }
  
  const fallbackSlides = [
    {
      id: "fallback-1",
      image: "/images/hero_bg_desa.png",
      title: "KEINDAHAN ALAM",
      subtitle: "Bintang Pertiwi - Tidore",
      description: "Nikmati pemandangan alam yang asri dan sejuk, membentang dari perbukitan hingga pesisir pantai. Sebuah harmoni alam yang menenangkan.",
    },
    {
      id: "fallback-2",
      image: "/images/hero_bg_desa_2.png",
      title: "PANEN RAYA",
      subtitle: "Pertanian Organik",
      description: "Sektor pertanian yang terus berkembang dengan hasil panen padi organik melimpah setiap musimnya. Bukti kesuburan tanah Bintang Pertiwi.",
    },
    {
      id: "fallback-3",
      image: "/images/hero_bg_desa_3.png",
      title: "PESONA PAGI",
      subtitle: "Destinasi Ekowisata",
      description: "Keindahan embun pagi dan udara segar menjadikan Bintang Pertiwi sebagai destinasi ekowisata favorit bagi wisatawan lokal maupun mancanegara.",
    },
  ];

  const galeriSlides = selectedGaleri.length > 0 
    ? selectedGaleri.slice(0, 5).map((item) => ({
        id: item.id,
        image: item.url_foto,
        title: item.judul || "Tanpa Judul",
        subtitle: item.kategori,
        description: item.deskripsi,
      }))
    : fallbackSlides;

  let parsedHeroSlides = undefined;
  if (globalConfig["beranda_hero_slides"]) {
    try {
      parsedHeroSlides = JSON.parse(globalConfig["beranda_hero_slides"]);
    } catch {
      // ignore JSON parse error
    }
  }

  const parseStat = (val: string | undefined) => {
    if (!val) return undefined;
    const parsed = parseInt(val.trim(), 10);
    return isNaN(parsed) ? undefined : parsed;
  };

  const totalPenduduk = parseStat(globalConfig["beranda_tentang_penduduk"]);
  const totalRw = parseStat(globalConfig["beranda_tentang_rw"]);
  const totalRt = parseStat(globalConfig["beranda_tentang_rt"]);
  const narasi = globalConfig["beranda_tentang_narasi"];

  return (
    <div className="flex flex-col w-full">
      <HeroBanner initialSlides={parsedHeroSlides} />
      {/* About Section */}
      <AboutSection 
        narasi={narasi} 
        totalPenduduk={totalPenduduk} 
        totalRw={totalRw} 
        totalRt={totalRt} 
      />
      {/* Galeri Section */}
      <GaleriSection initialSlides={galeriSlides} />
      {/* News Section */}
      <NewsSection 
        initialNews={beritaList.map(b => ({
          ...b,
          tanggal: formatDate(b.tanggal)
        }))} 
      />
    </div>
  );
}
