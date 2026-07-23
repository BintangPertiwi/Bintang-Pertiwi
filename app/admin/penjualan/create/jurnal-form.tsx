"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JurnalRow } from "@/types"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { expireJurnalCache } from "@/app/actions/jurnal"

export function JurnalForm({ initialData, existingProducts = [] }: { initialData?: JurnalRow, existingProducts?: string[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [productName, setProductName] = React.useState(initialData?.nama_item || "")
  const [comboboxOpen, setComboboxOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [customProducts, setCustomProducts] = React.useState<string[]>([])
  
  const allProducts = React.useMemo(() => {
    return Array.from(new Set([...existingProducts, ...customProducts]))
  }, [existingProducts, customProducts])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      const payload = {
        tanggal: formData.get("tanggal"),
        nama_item: productName, // Use the state from combobox
        jumlah_terjual: Number(formData.get("jumlah_terjual")),
        total_pendapatan: Number(formData.get("total_pendapatan")),
        keterangan: formData.get("keterangan"),
      }

      if (!payload.nama_item) {
        throw new Error("Nama produk wajib diisi.")
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
      await expireJurnalCache() // invalidate cache on server
      router.push("/admin/penjualan")
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
        <input type="hidden" name="nama_item" value={productName} />
        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
          <PopoverTrigger 
            render={
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className={cn("w-full justify-between h-10 font-normal bg-background", !productName && "text-muted-foreground")}
              />
            }
          >
            {productName || "Pilih atau ketik nama produk..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Cari atau tambah produk..." 
                value={search} 
                onValueChange={setSearch} 
              />
              <CommandList>
                <CommandEmpty>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-sm px-2 py-1.5 h-auto"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      const newProd = search.trim();
                      if (newProd && !customProducts.includes(newProd) && !existingProducts.includes(newProd)) {
                        setCustomProducts([...customProducts, newProd]);
                      }
                      setProductName(newProd);
                      setComboboxOpen(false);
                      setSearch("");
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Buat &quot;{search.trim()}&quot;
                  </Button>
                </CommandEmpty>
                <CommandGroup>
                  {allProducts.map((prod) => (
                    <CommandItem
                      key={prod}
                      value={prod}
                      onSelect={() => {
                        setProductName(prod);
                        setComboboxOpen(false);
                        setSearch("");
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", productName === prod ? "opacity-100" : "opacity-0")} />
                      {prod}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
