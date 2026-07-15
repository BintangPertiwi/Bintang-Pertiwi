import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { PetaFormFields } from "@/components/admin/peta/peta-form-fields";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getFasilitasList } from "@/lib/google-sheets";
import { getAllCategories } from "@/constants/peta";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Fasilitas — Bintang Pertiwi",
};

interface EditPetaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPetaPage({ params }: EditPetaPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const fasilitas = await getFasilitasList();
  
  const initialData = fasilitas.find((item) => item.id === id);
  if (!initialData) {
    notFound();
  }

  const dbCategories = Array.from(new Set(fasilitas.map((item) => item.kategori_ikon).filter(Boolean)));
  const existingCategories = Array.from(new Set([...getAllCategories(), ...dbCategories]));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Edit Fasilitas" />
      <DashboardHeader
        title="Edit Fasilitas"
        description={`Mengedit data fasilitas "${initialData.nama_fasum}".`}
      />

      <PetaFormFields existingCategories={existingCategories} initialData={initialData} />
    </div>
  );
}
