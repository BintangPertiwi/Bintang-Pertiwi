import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function LoadingGaleriList() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Galeri" 
        description="Kelola foto dan dokumentasi kegiatan."
      />
      <TableSkeleton columnCount={4} rowCount={10} />
    </div>
  );
}
