import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PengaturanBerandaForm } from "@/components/admin/pengaturan/pengaturan-beranda-form";
import { getGlobalConfig, getGaleriList } from "@/lib/db/queries";

export const metadata = {
  title: "Pengaturan Beranda — SIG-Bintang Pertiwi",
};

export default async function PengaturanBerandaPage() {
  const globalConfig = await getGlobalConfig();
  const galeriList = await getGaleriList();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Beranda" 
        description="Kelola teks dan gambar yang tampil di halaman utama website."
      />

      <PengaturanBerandaForm 
        globalConfig={globalConfig}
        galeriList={galeriList}
      />
    </div>
  );
}
