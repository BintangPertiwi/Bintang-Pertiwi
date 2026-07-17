import { CardGridSkeleton } from "@/components/ui/skeletons/card-grid-skeleton";

export default function LoadingBeritaList() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Berita & Pengumuman</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Memuat informasi terbaru...
        </p>
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
