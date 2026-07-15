import { type GalleryItem } from "@/components/public/beranda/bento-gallery";
import { PageHeader } from "@/components/public/common/page-header";
import { PaginatedGallery } from "@/components/public/galeri/paginated-gallery";
import { getGaleriList, getGlobalConfig } from "@/lib/db/queries";

export const metadata = {
  title: "Galeri — Bintang Pertiwi",
  description: "Koleksi foto dan dokumentasi kegiatan di Bintang Pertiwi.",
};

export default async function GaleriPage() {
  const galeriData = await getGaleriList();
  const globalConfig = await getGlobalConfig();
  
  const headerTitle = globalConfig["galeri_header_title"] || "Galeri";
  const headerDesc = globalConfig["galeri_header_desc"] || "Melihat lebih dekat keindahan alam, kegiatan masyarakat, dan momen-momen penting di Bintang Pertiwi.";

  let items: GalleryItem[] = [];
  
  if (galeriData.length > 0) {
    items = galeriData.map(g => ({
      id: g.id,
      image: g.url_foto,
      title: g.judul || "Tanpa Judul",
      category: g.kategori
    }));

    if (items.length < 7) {
      const baseItems = [...items];
      let loopIndex = 0;
      while (items.length < 7) {
        items.push({
          ...baseItems[loopIndex % baseItems.length],
          id: `duplicate-${items.length}`,
        });
        loopIndex++;
      }
    }
  } else {
    const fallbackImages = [
      "/images/hero_bg_desa.png",
      "/images/hero_bg_desa_2.png",
      "/images/hero_bg_desa_3.png"
    ];
    
    items = Array.from({ length: 7 }).map((_, i) => ({
      id: `dummy-${i}`,
      image: fallbackImages[i % fallbackImages.length],
      title: `Foto Galeri ${i + 1}`,
      category: "Umum"
    }));
  }

  return (
    <main className="w-full bg-slate-50 min-h-screen pb-20">
      <PageHeader 
        title={headerTitle} 
        description={headerDesc}
      />
      
      {/* Grid Container */}
      <div className="w-full pt-4 md:pt-10">
        <PaginatedGallery items={items} />
      </div>
    </main>
  );
}
