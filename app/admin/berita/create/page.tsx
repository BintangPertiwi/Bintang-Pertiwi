import { BeritaForm } from "@/components/admin/berita/berita-form";
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getBeritaList } from "@/lib/db/queries";

export const metadata = {
  title: "Tulis Berita Baru — Bintang Pertiwi",
};

export default async function CreateBeritaPage() {
  const beritaList = await getBeritaList();
  const existingCategories = Array.from(new Set(beritaList.map((item) => item.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tulis Berita Baru" />
      <DashboardHeader 
        title="Tulis Berita Baru" 
        description="Buat artikel untuk mempublikasikan kegiatan atau pengumuman dusun."
      />

      <BeritaForm existingCategories={existingCategories} />
    </div>
  );
}
