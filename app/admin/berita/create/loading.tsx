import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingBeritaCreate() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Tulis Berita Baru" 
        description="Buat artikel untuk mempublikasikan kegiatan atau pengumuman."
      />
      <FormSkeleton />
    </div>
  );
}
