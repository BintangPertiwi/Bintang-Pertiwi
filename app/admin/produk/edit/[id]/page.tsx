import { notFound } from "next/navigation";
import { getProdukById, getProdukList, getAdminById } from "@/lib/db/queries";
import { getSession } from "@/lib/auth";
import { ProdukForm } from "@/components/admin/produk/produk-form";
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";

export const metadata = {
  title: "Edit Produk — Bintang Pertiwi",
};

export default async function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const produkList = await getProdukList();
  const produk = await getProdukById(id);

  if (!produk) {
    notFound();
  }

  // Kontributor tidak boleh membuka produk milik orang lain.
  if (session?.role === "kontributor" && produk.created_by !== session.id) {
    notFound();
  }

  const existingCategories = Array.from(new Set(produkList.map((item) => item.kategori).filter(Boolean)));
  
  let defaultWa = "";
  if (session) {
    const adminUser = await getAdminById(session.id);
    defaultWa = adminUser?.wa_number || "";
  }

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label={produk.nama || "Edit Produk"} />
      <DashboardHeader
        title="Edit Produk"
        description="Ubah detail, harga, ketersediaan, atau gambar produk."
      />

      <ProdukForm existingCategories={existingCategories} initialData={produk} defaultWa={defaultWa} />
    </div>
  );
}
