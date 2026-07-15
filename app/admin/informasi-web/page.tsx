import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { InformasiWebForm } from "@/components/admin/pengaturan/informasi-web-form";
import { getGlobalConfig } from "@/lib/google-sheets";

export const metadata = {
  title: "Pengaturan Informasi Web — Admin Bintang Pertiwi",
  description: "Kelola informasi kontak dan profil sosial media dusun.",
};

export default async function InformasiWebPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Informasi Web" 
        description="Kelola informasi kontak dan tautan sosial media untuk ditampilkan di website."
      />
      <InformasiWebForm initialData={globalConfig} />
    </div>
  );
}
