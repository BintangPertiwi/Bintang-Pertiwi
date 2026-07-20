import { PageHeader } from "@/components/public/common/page-header";
import { ProdukDetail } from "@/components/public/produk-umkm/produk-detail";
import { getGlobalConfig, getProdukBySlug } from "@/lib/db/queries";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProdukBySlug(slug);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  const title = `${product.nama} — Bintang Pertiwi`;
  const description = product.deskripsi_singkat;
  const images = product.gambar_urls.length > 0 ? [product.gambar_urls[0]] : [];

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

export default async function ProdukDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProdukBySlug(slug);

  if (!product || product.gambar_urls.length === 0) {
    notFound();
  }

  // Nomor WA cadangan bila pemilik produk belum mengatur nomornya sendiri.
  const globalConfig = await getGlobalConfig();
  const fallbackWa = globalConfig["kontak_person_wa"] || "";

  return (
    <main className="w-full bg-background min-h-screen">
      <PageHeader
        title={product.nama}
        description="Detail informasi produk UMKM Bintang Pertiwi."
      />
      <ProdukDetail product={product} fallbackWa={fallbackWa} />
    </main>
  );
}
