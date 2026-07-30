import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPenggunaCreate() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Tambah Akun Baru" 
        description="Buat akun untuk kontributor atau admin baru."
      />
      <FormSkeleton />
    </div>
  );
}
