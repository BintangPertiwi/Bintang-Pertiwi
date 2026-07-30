import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { FormSkeleton } from "@/components/ui/skeletons/form-skeleton";

export default function LoadingKontakPerson() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Kontak Person"
        description="Atur nama dan nomor WhatsApp kontak person."
      />
      <FormSkeleton />
    </div>
  );
}
