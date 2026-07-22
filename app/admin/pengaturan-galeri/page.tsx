import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PengaturanGaleriForm } from "@/components/admin/pengaturan/pengaturan-galeri-form";
import { getGlobalConfig } from "@/lib/db/queries";

export const metadata = {
  title: "Pengaturan Galeri — Bintang Pertiwi",
};

export default async function PengaturanGaleriPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Halaman Galeri" 
        description="Kelola teks judul dan deskripsi pada header halaman galeri publik."
      />

      <PengaturanGaleriForm 
        globalConfig={globalConfig}
      />
    </div>
  );
}
