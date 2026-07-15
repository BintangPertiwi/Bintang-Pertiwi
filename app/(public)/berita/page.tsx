import { PageHeader } from "@/components/public/common/page-header";
import { BeritaLayout, BeritaItem } from "@/components/public/berita/berita-layout";
import { getGlobalConfig, getBeritaList } from "@/lib/google-sheets";
import { formatDate } from "@/lib/utils";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita — Bintang Pertiwi",
  description: "Kumpulan berita, pengumuman, dan artikel terbaru seputar kegiatan di Bintang Pertiwi.",
  openGraph: {
    title: "Berita — Bintang Pertiwi",
    description: "Kumpulan berita, pengumuman, dan artikel terbaru seputar kegiatan di Bintang Pertiwi.",
    url: "https://www.bintangpertiwi.com/berita",
  },
  twitter: {
    card: "summary_large_image",
    title: "Berita — Bintang Pertiwi",
    description: "Kumpulan berita, pengumuman, dan artikel terbaru seputar kegiatan di Bintang Pertiwi.",
  },
};

export default async function BeritaPage() {
  const globalConfig = await getGlobalConfig();
  
  const headerTitle = globalConfig["berita_header_title"] || "Berita & Pengumuman";
  const headerDesc = globalConfig["berita_header_desc"] || "Dapatkan informasi terkini, artikel, dan pengumuman resmi seputar aktivitas masyarakat di Bintang Pertiwi.";

  const allBerita = await getBeritaList();
  const rawBerita = allBerita.filter(b => b.status_publikasi === "Publik" || !b.status_publikasi);

  const categories = Array.from(new Set(rawBerita.map((b) => b.kategori))).filter(Boolean);
  if (categories.length === 0) categories.push("Umum");

  const items: BeritaItem[] = rawBerita.map((b) => ({
    id: b.id,
    title: b.judul,
    summary: b.ringkasan,
    date: formatDate(b.tanggal),
    image: b.url_foto || "/images/placeholder.jpg",
    category: b.kategori || "Umum"
  }));

  return (
    <main className="w-full bg-white min-h-screen">
      <PageHeader 
        title={headerTitle} 
        description={headerDesc}
      />
      <BeritaLayout items={items} categories={categories} />
    </main>
  );
}
