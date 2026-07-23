import { BeritaDetail } from "@/components/public/berita/berita-detail";

import { getPublicBeritaById, getBeritaList } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { stripHtml } from "@/lib/listing";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const berita = await getPublicBeritaById(id);
  
  if (!berita || (berita.status_publikasi !== "Publik" && berita.status_publikasi)) {
    return {
      title: "Berita Tidak Ditemukan — Bintang Pertiwi",
    };
  }

  const title = `${berita.judul} — Bintang Pertiwi`;
  const description = stripHtml(berita.ringkasan || berita.isi_berita).substring(0, 150) + "...";
  const images = berita.url_foto ? [berita.url_foto] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    }
  };
}

export async function generateStaticParams() {
  const list = await getBeritaList();
  const publicList = list.filter((b) => b.status_publikasi === "Publik" || !b.status_publikasi);
  
  if (publicList.length === 0) {
    return [{ id: "_empty" }];
  }
  
  return publicList.map((b) => ({ id: b.id }));
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const beritaData = await getPublicBeritaById(id);

  if (!beritaData || (beritaData.status_publikasi !== "Publik" && beritaData.status_publikasi)) {
    notFound();
  }

  const detail = {
    id: beritaData.id,
    title: beritaData.judul,
    date: formatDate(beritaData.tanggal),
    image: beritaData.url_foto || "/images/placeholder.jpg",
    category: beritaData.kategori || "Umum",
    content: beritaData.isi_berita,
  };

  return <BeritaDetail berita={detail} />;
}
