import { notFound } from "next/navigation";
import { getGaleriList } from "@/lib/google-sheets";
import { GaleriFormFields } from "@/components/admin/galeri/galeri-form-fields";
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";

export const metadata = {
  title: "Edit Galeri — Bintang Pertiwi",
};

export default async function EditGaleriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const galeriList = await getGaleriList();
  const galeri = galeriList.find((item) => item.id === id);

  if (!galeri) {
    notFound();
  }

  const existingCategories = Array.from(new Set(galeriList.map((item) => item.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label={galeri.judul || "Edit Galeri"} />
      <DashboardHeader
        title="Edit Galeri"
        description="Ubah kategori, judul, atau foto yang sudah diunggah."
      />

      <GaleriFormFields existingCategories={existingCategories} initialData={galeri} />
    </div>
  );
}
