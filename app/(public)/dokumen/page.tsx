import { PageHeader } from "@/components/public/common/page-header";
import { DokumenLayout } from "@/components/public/dokumen/dokumen-layout";
import { getDokumenList, getGlobalConfig } from "@/lib/db/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumen — Bintang Pertiwi",
  description:
    "Kumpulan dokumen resmi, kebijakan, formulir, dan laporan Bintang Pertiwi. Cari, lihat pratinjau, atau unduh dokumen yang Anda butuhkan.",
};

export default async function DokumenPage() {
  const documents = await getDokumenList();
  const globalConfig = await getGlobalConfig();
  const categories = Array.from(new Set(documents.map((d) => d.kategori).filter(Boolean)));

  const headerTitle = globalConfig["dokumen_header_title"] || "Dokumen";
  const headerDesc = globalConfig["dokumen_header_desc"] || "Kumpulan dokumen resmi, kebijakan, formulir, dan laporan. Cari, lihat pratinjau, atau unduh dokumen yang Anda butuhkan.";

  return (
    <main className="w-full bg-background min-h-screen pb-20">
      <PageHeader
        title={headerTitle}
        description={headerDesc}
      />
      <DokumenLayout documents={documents} categories={categories} />
    </main>
  );
}
