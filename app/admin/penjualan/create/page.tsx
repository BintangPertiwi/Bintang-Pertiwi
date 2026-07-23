import { Metadata } from "next"
import { JurnalForm } from "./jurnal-form"
import { DashboardHeader } from "@/components/admin/layout/dashboard-header"
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context"

export const metadata: Metadata = {
  title: "Tambah Jurnal Penjualan — Bintang Pertiwi",
  description: "Formulir penambahan rekam jurnal penjualan",
}

export default function CreateJurnalPage() {
  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tambah Jurnal" />
      <DashboardHeader 
        title="Tambah Jurnal Penjualan" 
        description="Catat transaksi penjualan produk Anda hari ini."
      />
      
      <div className="max-w-3xl">
        <JurnalForm />
      </div>
    </div>
  )
}

