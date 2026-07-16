import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { ProdukForm } from "@/components/admin/produk/produk-form";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getProdukList } from "@/lib/db/queries";

export const metadata = {
  title: "Tambah Produk — Bintang Pertiwi",
};

export default async function CreateProdukPage() {
  const produkList = await getProdukList();
  const existingCategories = Array.from(new Set(produkList.map((item) => item.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tambah Produk" />
      <DashboardHeader
        title="Tambah Produk"
        description="Tambahkan produk UMKM baru beserta gambar, harga, dan deskripsinya."
      />

      <ProdukForm existingCategories={existingCategories} />
    </div>
  );
}
