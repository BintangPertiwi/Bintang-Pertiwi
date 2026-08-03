import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context"
import { DashboardHeader } from "@/components/admin/layout/dashboard-header"
import { getSession } from "@/lib/auth"
import { getJurnalById } from "@/lib/db/queries/jurnal"
import { getProdukForJurnal } from "@/lib/db/queries/produk"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { JurnalForm } from "../../create/jurnal-form"

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

  if (session?.role === "kontributor" && jurnal.created_by !== session.id) {
    notFound()
  }

  const ownerId = session?.role === "kontributor" ? session.id : undefined;
  const products = await getProdukForJurnal(ownerId);

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Edit Jurnal" />
      <DashboardHeader 
        title="Edit Jurnal Penjualan" 
        description="Perbarui data pencatatan penjualan produk Anda."
      />
      
      <div className="max-w-3xl">
        <JurnalForm initialData={jurnal} existingProducts={products} />
      </div>
    </div>
  )
}
