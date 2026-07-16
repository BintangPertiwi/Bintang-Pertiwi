import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingProdukCreate() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Tambah Produk"
        description="Tambahkan produk UMKM baru beserta gambar, harga, dan deskripsinya."
      />
      <FormSkeleton />
    </div>
  );
}
