import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { GaleriFormFields } from "@/components/admin/galeri/galeri-form-fields";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getGaleriList } from "@/lib/db/queries";

export const metadata = {
  title: "Unggah Galeri — Bintang Pertiwi",
};

export default async function CreateGaleriPage() {
  const galeriList = await getGaleriList();
  const existingCategories = Array.from(new Set(galeriList.map((item) => item.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Unggah Galeri" />
      <DashboardHeader
        title="Unggah Galeri"
        description="Tambahkan foto kegiatan dusun dengan tampilan form yang lebih nyaman."
      />

      <GaleriFormFields existingCategories={existingCategories} />
    </div>
  );
}
