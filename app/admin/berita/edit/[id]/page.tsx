import { notFound } from "next/navigation";
import { getBeritaById, getBeritaList } from "@/lib/db/queries";
import { BeritaForm } from "@/components/admin/berita/berita-form";
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";

export const metadata = {
  title: "Edit Berita — Bintang Pertiwi",
};

export default async function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const berita = await getBeritaById(id);
  const beritaList = await getBeritaList();

  const existingCategories = Array.from(new Set(beritaList.map((item) => item.kategori).filter(Boolean)));

  if (!berita) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label={berita.judul} />
      <DashboardHeader 
        title="Edit Berita" 
        description="Perbarui informasi atau kesalahan penulisan pada berita."
      />

      <BeritaForm initialData={berita} existingCategories={existingCategories} />
    </div>
  );
}
