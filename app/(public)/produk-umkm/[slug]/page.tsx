import { PageHeader } from "@/components/public/common/page-header";
import { ProdukDetail } from "@/components/public/produk-umkm/produk-detail";
import { DUMMY_PRODUCTS } from "@/constants/dummy-products";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = DUMMY_PRODUCTS.find((p) => p.slug === slug);
  
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
  const product = DUMMY_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
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
