import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPenjualanCreate() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Tambah Jurnal Penjualan" 
        description="Catat transaksi penjualan produk Anda hari ini."
      />
      <FormSkeleton />
    </div>
  );
}
