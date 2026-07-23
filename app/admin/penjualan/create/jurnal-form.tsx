"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { JurnalRow } from "@/types"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

export function JurnalForm({ initialData }: { initialData?: JurnalRow }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      const payload = {
        tanggal: formData.get("tanggal"),
        nama_item: formData.get("nama_item"),
        jumlah_terjual: Number(formData.get("jumlah_terjual")),
        total_pendapatan: Number(formData.get("total_pendapatan")),
        keterangan: formData.get("keterangan"),
      }

      const url = initialData ? `/api/jurnal/${initialData.id}` : "/api/jurnal"
      const method = initialData ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Terjadi kesalahan")
      }

      toast.success(initialData ? "Jurnal berhasil diperbarui" : "Jurnal berhasil ditambahkan")
      router.push("/admin/penjualan")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan jurnal"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tanggal">Tanggal Transaksi</Label>
        <Input
          id="tanggal"
          name="tanggal"
          type="date"
          required
          defaultValue={initialData?.tanggal ? initialData.tanggal.split('T')[0] : today}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama_item">Nama Produk / Item</Label>
        <Input
          id="nama_item"
          name="nama_item"
          placeholder="Contoh: Keripik Jamur Tiram 100g"
          required
          defaultValue={initialData?.nama_item}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jumlah_terjual">Jumlah Terjual (Qty)</Label>
          <Input
            id="jumlah_terjual"
            name="jumlah_terjual"
            type="number"
            min="1"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            required
            defaultValue={initialData?.jumlah_terjual}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_pendapatan">Nominal Transaksi (Rp)</Label>
          <Input
            id="total_pendapatan"
            name="total_pendapatan"
            type="number"
            placeholder="Gunakan minus (-) jika pengeluaran"
            required
            defaultValue={initialData?.total_pendapatan}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
        <Textarea
          id="keterangan"
          name="keterangan"
          placeholder="Catatan tambahan seperti nama pembeli, platform, atau metode pembayaran..."
          defaultValue={initialData?.keterangan}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : (initialData ? "Simpan Perubahan" : "Simpan Jurnal")}
        </Button>
      </div>
    </form>
  )
}
