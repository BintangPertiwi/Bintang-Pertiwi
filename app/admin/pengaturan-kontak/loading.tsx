import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPengaturanKontak() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Pengaturan Kontak"
        description="Atur tampilan halaman kontak publik."
      />
      <FormSkeleton />
    </div>
  );
}
