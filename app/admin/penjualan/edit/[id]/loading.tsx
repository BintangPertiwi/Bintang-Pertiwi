import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPenjualanEdit() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Edit Jurnal Penjualan" 
        description="Perbarui data transaksi penjualan."
      />
      <FormSkeleton />
    </div>
  );
}
