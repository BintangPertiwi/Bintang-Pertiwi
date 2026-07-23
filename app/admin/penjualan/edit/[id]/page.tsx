import { Metadata } from "next"
import { JurnalForm } from "../../create/jurnal-form"
import { getJurnalById } from "@/lib/db/queries/jurnal"
import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "@/components/admin/layout/dashboard-header"
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context"
import { getProdukNamesByOwner } from "@/lib/db/queries/produk"

export const metadata: Metadata = {
  title: "Edit Jurnal Penjualan",
  description: "Formulir pembaruan rekam jurnal penjualan",
}

export default async function EditJurnalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  const jurnal = await getJurnalById(id)

  if (!jurnal) {
    notFound()
  }

  // Kontributor tidak boleh mengedit jurnal milik orang lain
  if (session?.role === "kontributor" && jurnal.created_by !== session.id) {
    notFound()
  }

  const ownerId = session?.role === "kontributor" ? session.id : undefined;
  const produkNames = await getProdukNamesByOwner(ownerId);

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Edit Jurnal" />
      <DashboardHeader 
        title="Edit Jurnal Penjualan" 
        description="Perbarui data pencatatan penjualan produk Anda."
      />
      
      <div className="max-w-3xl">
        <JurnalForm initialData={jurnal} existingProducts={produkNames} />
      </div>
    </div>
  )
}
