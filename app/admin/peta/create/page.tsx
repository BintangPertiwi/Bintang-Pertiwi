import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { PetaFormFields } from "@/components/admin/peta/peta-form-fields";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getFasilitasList } from "@/lib/db/queries";
import { getAllCategories } from "@/constants/peta";

export const metadata = {
  title: "Tambah Fasilitas — Bintang Pertiwi",
};

export default async function CreatePetaPage() {
  const fasilitas = await getFasilitasList();
  const dbCategories = Array.from(new Set(fasilitas.map((item) => item.kategori_ikon).filter(Boolean)));
  const existingCategories = Array.from(new Set([...getAllCategories(), ...dbCategories]));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tambah Fasilitas" />
      <DashboardHeader
        title="Tambah Fasilitas"
        description="Tambahkan titik fasilitas baru ke dalam peta lokasi."
      />

      <PetaFormFields existingCategories={existingCategories} />
    </div>
  );
}
