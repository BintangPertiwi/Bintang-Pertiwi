import { CardGridSkeleton } from "@/components/ui/skeletons/card-grid-skeleton";

export default function LoadingGaleriList() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Galeri</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Memuat dokumentasi visual...
        </p>
      </div>
      <CardGridSkeleton count={9} />
    </div>
  );
}
