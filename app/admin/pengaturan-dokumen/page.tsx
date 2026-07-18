import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PengaturanDokumenForm } from "@/components/admin/pengaturan/pengaturan-dokumen-form";
import { getGlobalConfig } from "@/lib/db/queries";

export const metadata = {
  title: "Pengaturan Dokumen — Admin Bintang Pertiwi",
};

export default async function PengaturanDokumenPage() {
  const globalConfig = await getGlobalConfig();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Pengaturan Halaman Dokumen"
        description="Kelola teks judul dan deskripsi pada header halaman dokumen publik."
      />

      <PengaturanDokumenForm globalConfig={globalConfig} />
    </div>
  );
}
