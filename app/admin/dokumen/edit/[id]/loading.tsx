import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingDokumenEdit() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Edit Dokumen" 
        description="Perbarui informasi dokumen."
      />
      <FormSkeleton />
    </div>
  );
}
