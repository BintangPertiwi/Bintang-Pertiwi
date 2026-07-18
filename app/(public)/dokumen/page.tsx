import { PageHeader } from "@/components/public/common/page-header";
import { DokumenLayout } from "@/components/public/dokumen/dokumen-layout";
import { getDokumenList } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumen — Bintang Pertiwi",
  description:
    "Kumpulan dokumen resmi, kebijakan, formulir, dan laporan Bintang Pertiwi. Cari, lihat pratinjau, atau unduh dokumen yang Anda butuhkan.",
};

export default async function DokumenPage() {
  const documents = await getDokumenList();
  const categories = Array.from(new Set(documents.map((d) => d.kategori).filter(Boolean)));

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <PageHeader
        title="Dokumen"
        description="Kumpulan dokumen resmi, kebijakan, formulir, dan laporan. Cari, lihat pratinjau, atau unduh dokumen yang Anda butuhkan."
      />
      <DokumenLayout documents={documents} categories={categories} />
    </main>
  );
}
