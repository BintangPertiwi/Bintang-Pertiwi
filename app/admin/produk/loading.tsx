import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function LoadingProdukList() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Manajemen Produk UMKM"
        description="Kelola katalog produk UMKM yang tampil di halaman publik."
      />
      <TableSkeleton columnCount={5} rowCount={8} />
    </div>
  );
}
