import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPeta() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Peta Lokasi" 
        description="Kelola informasi batas wilayah dan marker penting pada peta."
      />
      <div className="w-full max-w-4xl space-y-8 pb-20">
        <Skeleton className="h-[500px] w-full rounded-xl" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-12 w-full mt-8" />
      </div>
    </div>
  );
}
