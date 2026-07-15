import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingPengaturanProfil() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Profil" 
        description="Kelola informasi profil, visi misi, dan sejarah."
      />
      <FormSkeleton />
    </div>
  );
}
