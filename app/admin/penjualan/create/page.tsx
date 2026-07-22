import { Metadata } from "next"
import { JurnalForm } from "./jurnal-form"

export const metadata: Metadata = {
  title: "Tambah Jurnal Penjualan",
  description: "Formulir penambahan rekam jurnal penjualan",
}

export default function CreateJurnalPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tambah Jurnal Penjualan
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Catat transaksi penjualan produk Anda hari ini.
        </p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <JurnalForm />
      </div>
    </div>
  )
}
