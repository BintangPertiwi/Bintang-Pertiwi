import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { ProdukForm } from "@/components/admin/produk/produk-form";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getProdukList, getAdminById } from "@/lib/db/queries";
import { verifyAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Tambah Produk — Bintang Pertiwi",
};

export default async function CreateProdukPage() {
  const session = await verifyAdminSession();
  if (!session) redirect("/login");

  const [produkList, adminUser] = await Promise.all([
    getProdukList(),
    getAdminById(session.id)
  ]);

  const existingCategories = Array.from(new Set(produkList.map((item) => item.kategori).filter(Boolean)));
  const defaultWa = adminUser?.wa_number || "";

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tambah Produk" />
      <DashboardHeader
        title="Tambah Produk"
        description="Tambahkan produk UMKM baru beserta gambar, harga, dan deskripsinya."
      />

      <ProdukForm existingCategories={existingCategories} defaultWa={defaultWa} />
    </div>
  );
}
