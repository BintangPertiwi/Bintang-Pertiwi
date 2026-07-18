import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PengaturanKontakForm } from "@/components/admin/pengaturan/pengaturan-kontak-form";
import { getGlobalConfig } from "@/lib/db/queries";

export const metadata = {
  title: "Pengaturan Kontak — Admin Bintang Pertiwi",
};

export default async function PengaturanKontakPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Pengaturan Halaman Kontak"
        description="Kelola teks judul dan deskripsi pada header halaman kontak publik."
      />

      <PengaturanKontakForm globalConfig={globalConfig} />
    </div>
  );
}
