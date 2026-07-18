import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DokumenFormFields } from "@/components/admin/dokumen/dokumen-form-fields";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getDokumenList } from "@/lib/db/queries";

export const metadata = {
  title: "Tambah Dokumen — Bintang Pertiwi",
};

export default async function CreateDokumenPage() {
  const dokumenList = await getDokumenList();
  const existingCategories = Array.from(new Set(dokumenList.map((item) => item.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tambah Dokumen" />
      <DashboardHeader
        title="Tambah Dokumen"
        description="Unggah dokumen PDF atau Office beserta judul dan kategorinya."
      />

      <DokumenFormFields existingCategories={existingCategories} />
    </div>
  );
}
