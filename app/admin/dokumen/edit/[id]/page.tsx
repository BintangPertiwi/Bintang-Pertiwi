import { notFound } from "next/navigation";
import { getDokumenById, getDokumenList } from "@/lib/db/queries";
import { DokumenFormFields } from "@/components/admin/dokumen/dokumen-form-fields";
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";

export const metadata = {
  title: "Edit Dokumen — Bintang Pertiwi",
};

export default async function EditDokumenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dokumenList = await getDokumenList();
  const dokumen = await getDokumenById(id);

  if (!dokumen) {
    notFound();
  }

  const existingCategories = Array.from(new Set(dokumenList.map((item) => item.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label={dokumen.judul || "Edit Dokumen"} />
      <DashboardHeader
        title="Edit Dokumen"
        description="Ubah judul, kategori, deskripsi, atau ganti file dokumen."
      />

      <DokumenFormFields existingCategories={existingCategories} initialData={dokumen} />
    </div>
  );
}
