import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPengaturanDokumen() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Pengaturan Dokumen"
        description="Atur tampilan halaman dokumen publik."
      />
      <FormSkeleton />
    </div>
  );
}
