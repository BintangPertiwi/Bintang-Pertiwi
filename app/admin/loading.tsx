import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { DashboardSkeleton } from "@/components/ui/skeletons/dashboard-skeleton";

export default function LoadingAdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Dashboard" 
        description="Ringkasan informasi dan statistik website Bintang Pertiwi."
      />
      <DashboardSkeleton />
    </div>
  );
}
