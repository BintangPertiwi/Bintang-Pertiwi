import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PengaturanBeritaForm } from "@/components/admin/pengaturan/pengaturan-berita-form";
import { getGlobalConfig } from "@/lib/db/queries";

export const metadata = {
  title: "Pengaturan Berita — SIG-Bintang Pertiwi",
};

export default async function PengaturanBeritaPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Halaman Berita" 
        description="Kelola teks judul dan deskripsi pada header halaman berita publik."
      />

      <PengaturanBeritaForm 
        globalConfig={globalConfig}
      />
    </div>
  );
}
