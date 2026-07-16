import { notFound } from "next/navigation";
import { getProdukById, getProdukList } from "@/lib/db/queries";
import { ProdukForm } from "@/components/admin/produk/produk-form";
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";

export const metadata = {
  title: "Edit Produk — Bintang Pertiwi",
};

export default async function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produkList = await getProdukList();
  const produk = await getProdukById(id);

  if (!produk) {
    notFound();
  }

  const existingCategories = Array.from(new Set(produkList.map((item) => item.kategori).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label={produk.nama || "Edit Produk"} />
      <DashboardHeader
        title="Edit Produk"
        description="Ubah detail, harga, ketersediaan, atau gambar produk."
      />

      <ProdukForm existingCategories={existingCategories} initialData={produk} />
    </div>
  );
}
