import { PageHeader } from "@/components/public/common/page-header";
import { ProdukCardSkeletonGrid } from "@/components/ui/skeletons/produk-card-skeleton";

export default function LoadingProdukList() {
  return (
    <main className="w-full bg-muted/50 min-h-screen">
      <PageHeader
        title="Katalog Produk UMKM"
        description="Temukan berbagai produk pertanian segar, olahan makanan, dan kerajinan tangan hasil karya masyarakat Bintang Pertiwi."
      />
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <ProdukCardSkeletonGrid count={9} />
      </div>
    </main>
  );
}
