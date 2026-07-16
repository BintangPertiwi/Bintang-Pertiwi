import { PageHeader } from "@/components/public/common/page-header";
import { ProdukDetail } from "@/components/public/produk-umkm/produk-detail";
import { getProdukBySlug } from "@/lib/db/queries";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProdukBySlug(slug);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  return {
    title: `${product.nama} — Bintang Pertiwi`,
    description: product.deskripsi_singkat,
  };
}

export default async function ProdukDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProdukBySlug(slug);

  if (!product || product.gambar_urls.length === 0) {
    notFound();
  }

  return (
    <main className="w-full bg-white min-h-screen">
      <PageHeader
        title={product.nama}
        description="Detail informasi produk UMKM Bintang Pertiwi."
      />
      <ProdukDetail product={product} />
    </main>
  );
}
