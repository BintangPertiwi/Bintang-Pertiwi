import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function LoadingPenjualan() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Jurnal Penjualan" 
        description="Catat dan pantau riwayat penjualan produk UMKM Anda."
      />
      <div className="grid gap-4 mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-36 mt-2" />
            <Skeleton className="h-3 w-40 mt-2" />
          </div>
        ))}
      </div>
      <TableSkeleton columnCount={6} rowCount={8} />
    </div>
  );
}
