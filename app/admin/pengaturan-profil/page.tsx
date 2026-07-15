import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PengaturanProfilForm } from "@/components/admin/pengaturan/pengaturan-profil-form";
import { getGlobalConfig } from "@/lib/db/queries";

export const metadata = {
  title: "Pengaturan Profil — SIG-Bintang Pertiwi",
};

export default async function PengaturanProfilPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Profil" 
        description="Kelola teks visi misi serta bagian sejarah dan potensi pada halaman profil."
      />

      <PengaturanProfilForm 
        globalConfig={globalConfig}
      />
    </div>
  );
}
