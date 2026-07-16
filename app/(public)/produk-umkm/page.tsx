import { PageHeader } from "@/components/public/common/page-header";
import { ProdukLayout } from "@/components/public/produk-umkm/produk-layout";
import { getProdukList } from "@/lib/db/queries";

export const metadata = {
  title: "Produk UMKM — Bintang Pertiwi",
  description: "Katalog produk UMKM unggulan dari masyarakat Bintang Pertiwi.",
};

export default async function ProdukUmkmPage() {
  const products = (await getProdukList()).filter((product) => product.gambar_urls.length > 0);
  const categories = [
    "Semua",
    ...Array.from(new Set(products.map((product) => product.kategori).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "id")
    ),
  ];

  return (
    <main className="w-full bg-slate-50/50 min-h-screen">
      <PageHeader
        title="Katalog Produk UMKM"
        description="Temukan berbagai produk pertanian segar, olahan makanan, dan kerajinan tangan hasil karya masyarakat Bintang Pertiwi."
      />
      <ProdukLayout products={products} categories={categories} />
    </main>
  );
}
