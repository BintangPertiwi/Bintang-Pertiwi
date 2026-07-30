import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingDokumenCreate() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Unggah Dokumen" 
        description="Unggah dokumen baru untuk ditampilkan di halaman publik."
      />
      <FormSkeleton />
    </div>
  );
}
