import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingGaleriCreate() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Tambah Galeri" 
        description="Unggah foto baru ke galeri."
      />
      <FormSkeleton />
    </div>
  );
}
