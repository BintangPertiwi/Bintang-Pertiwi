import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingProdukEdit() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Edit Produk"
        description="Ubah detail, harga, ketersediaan, atau gambar produk."
      />
      <FormSkeleton />
    </div>
  );
}
