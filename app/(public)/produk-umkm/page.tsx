import { PageHeader } from "@/components/public/common/page-header";
import { ProdukLayout } from "@/components/public/produk-umkm/produk-layout";
import { DUMMY_PRODUCTS, PRODUCT_CATEGORIES } from "@/constants/dummy-products";

export const metadata = {
  title: "Produk UMKM — Bintang Pertiwi",
  description: "Katalog produk UMKM unggulan dari masyarakat Bintang Pertiwi.",
};

export default function ProdukUmkmPage() {
  return (
    <main className="w-full bg-slate-50/50 min-h-screen">
      <PageHeader 
        title="Katalog Produk UMKM" 
        description="Temukan berbagai produk pertanian segar, olahan makanan, dan kerajinan tangan hasil karya masyarakat Bintang Pertiwi."
      />
      <ProdukLayout products={DUMMY_PRODUCTS} categories={PRODUCT_CATEGORIES} />
    </main>
  );
}
