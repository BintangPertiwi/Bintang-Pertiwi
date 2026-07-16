import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { KontakPersonForm } from "@/components/admin/pengaturan/kontak-person-form";
import { getGlobalConfig } from "@/lib/db/queries";

export const metadata = {
  title: "Kontak Person — Admin Bintang Pertiwi",
  description: "Kelola nomor WhatsApp kontak person yang dituju form kontak publik.",
};

export default async function KontakPersonPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Kontak Person"
        description="Atur nama dan nomor WhatsApp kontak person. Form di halaman Kontak publik akan mengarahkan pesan ke nomor ini."
      />
      <KontakPersonForm initialData={globalConfig} />
    </div>
  );
}
