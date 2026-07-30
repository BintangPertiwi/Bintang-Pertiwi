import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function LoadingPengguna() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Manajemen Pengguna" 
        description="Buat dan kelola akun Super Admin &amp; Kontributor (pelaku UMKM)."
      />
      <TableSkeleton columnCount={5} rowCount={6} />
    </div>
  );
}
