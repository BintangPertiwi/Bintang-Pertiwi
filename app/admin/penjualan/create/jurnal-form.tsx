"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, Trash2, ImagePlus } from "lucide-react"
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
  const [pendapatan, setPendapatan] = React.useState(
    initialData?.total_pendapatan != null ? String(initialData.total_pendapatan) : ""
  )
  const [urlNota, setUrlNota] = React.useState(initialData?.url_nota || "")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  
  const allProducts = React.useMemo(() => {
    return Array.from(new Set([...existingProducts, ...customProducts]))
  }, [existingProducts, customProducts])

  const today = new Date().toISOString().split('T')[0]

  const processUpload = async (file: File) => {
    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Ukuran file nota maksimal 3MB.")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("namaProduk", productName || "produk")
    
    // Get date from input or fallback to today
    const dateInput = document.getElementById("tanggal") as HTMLInputElement
    formData.append("tanggal", dateInput?.value || today)

    try {
      const res = await fetch("/api/jurnal/upload-nota", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Gagal mengunggah berkas nota.")
      }

      const data = await res.json()
      setUrlNota(data.url)
      toast.success("Gambar nota berhasil diunggah.")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah."
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadNota = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      const rawPendapatan = pendapatan.replace(/\D/g, "")

      const payload = {
        tanggal: formData.get("tanggal"),
        nama_item: productName,
        jumlah_terjual: Number(formData.get("jumlah_terjual")),
        total_pendapatan: Number(rawPendapatan),
        keterangan: formData.get("keterangan"),
        url_nota: urlNota,
      }

      if (!payload.nama_item) {
        throw new Error("Nama produk wajib diisi.")
      }

      if (payload.jumlah_terjual < 1) {
        throw new Error("Jumlah terjual harus minimal 1.")
      }

      if (!rawPendapatan || payload.total_pendapatan <= 0) {
        throw new Error("Nominal transaksi harus diisi dan lebih dari 0.")
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
      await expireJurnalCache()
      router.push("/admin/penjualan")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan jurnal"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="tanggal" className="text-sm font-semibold">
            Tanggal Transaksi <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            id="tanggal"
            name="tanggal"
            type="date"
            required
            defaultValue={initialData?.tanggal ? initialData.tanggal.split('T')[0] : today}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="nama_item" className="text-sm font-semibold">
            Nama Produk / Item <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <input type="hidden" name="nama_item" value={productName} />
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger 
              render={
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className={cn("w-full justify-between h-14 font-normal bg-background", !productName && "text-muted-foreground")}
                />
              }
            >
              {productName || "Pilih atau ketik nama produk..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-(--anchor-width) p-0" align="start">
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

        <div className="space-y-2">
          <Label htmlFor="jumlah_terjual" className="text-sm font-semibold">
            Jumlah Terjual (Qty) <span className="text-red-500 ml-0.5">*</span>
          </Label>
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
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault()
            }}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (val < 0) e.target.value = "0"
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_pendapatan" className="text-sm font-semibold">
            Nominal Transaksi (Rp) <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <CurrencyInput
            id="total_pendapatan"
            placeholder="Contoh: 15.000"
            value={pendapatan}
            onChange={(rawDigits) => setPendapatan(rawDigits)}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="keterangan" className="text-sm font-semibold">Keterangan (Opsional)</Label>
          <Textarea
            id="keterangan"
            name="keterangan"
            placeholder="Catatan tambahan seperti nama pembeli, platform, atau metode pembayaran..."
            defaultValue={initialData?.keterangan}
            rows={4}
            className="resize-none min-h-[100px]"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label className="text-sm font-semibold">Gambar Nota (Opsional)</Label>
          <div className="relative group mt-1">
            {urlNota ? (
              <div className="relative w-full aspect-video md:w-[300px] border rounded-md overflow-hidden bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={urlNota} 
                  alt="Nota Penjualan" 
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setUrlNota("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                  title="Hapus Nota"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="nota-file"
                className={`flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-md cursor-pointer overflow-hidden transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent hover:border-slate-400/80 hover:bg-muted"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                    <p className="text-[13px] text-muted-foreground animate-pulse">
                      Mengunggah...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                    <div className="flex gap-4 items-center mb-3 text-muted-foreground">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-muted-foreground mb-1">
                      Geser & Lepas berkas disini
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Format didukung: JPG, JPEG, PNG. Maks: 3MB.
                    </p>
                  </div>
                )}
                <Input
                  id="nota-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadNota}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="destructive"
          disabled={isSubmitting}
          className="w-full sm:w-auto text-base h-14 order-2 sm:order-1"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
        >
          {isSubmitting ? "Menyimpan..." : (initialData ? "Simpan Perubahan" : "Simpan Jurnal")}
        </Button>
      </div>
    </form>
  )
}
