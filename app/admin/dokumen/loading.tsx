import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function LoadingDokumen() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Manajemen Dokumen" 
        description="Kelola dokumen (PDF/Office) yang tampil di halaman publik."
      />
      <TableSkeleton columnCount={5} rowCount={8} />
    </div>
  );
}
