import { Metadata } from "next"
import { JurnalForm } from "../../create/jurnal-form"
import { getJurnalById } from "@/lib/db/queries/jurnal"
import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Jurnal Penjualan
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Perbarui data pencatatan penjualan produk Anda.
        </p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <JurnalForm initialData={jurnal} />
      </div>
    </div>
  )
}
