"use client"

import { expireJurnalCache } from "@/app/actions/jurnal"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { JurnalRow } from "@/types"
import { Check, ChevronsUpDown, ImagePlus, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

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
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState(initialData?.url_nota || "")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  
  const allProducts = React.useMemo(() => {
    return Array.from(new Set([...existingProducts, ...customProducts]))
  }, [existingProducts, customProducts])

  const today = new Date().toISOString().split('T')[0]

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (file: File) => {
    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Ukuran file nota maksimal 3MB.")
      return
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setSelectedFile(file)
  }

  const handleUploadNota = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
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

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleRemoveNota = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl("")
    setSelectedFile(null)
    setUrlNota("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const rawPendapatan = pendapatan.replace(/\D/g, "")

      if (!productName) throw new Error("Nama produk wajib diisi.")
      if (Number(formData.get("jumlah_terjual")) < 1) throw new Error("Jumlah terjual harus minimal 1.")
      if (!rawPendapatan || Number(rawPendapatan) <= 0) throw new Error("Nominal transaksi harus diisi dan lebih dari 0.")

      if (initialData) {
        let finalUrlNota = urlNota;

        if (selectedFile) {
          setIsUploading(true)
          const uploadForm = new FormData()
          uploadForm.append("file", selectedFile)
          uploadForm.append("namaProduk", productName)
          uploadForm.append("tanggal", (formData.get("tanggal") as string) || today)

          const uploadRes = await fetch("/api/jurnal/upload-nota", {
            method: "POST",
            body: uploadForm,
          })

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json()
            throw new Error(errorData.message || "Gagal mengunggah nota baru.")
          }

          const uploadData = await uploadRes.json()
          finalUrlNota = uploadData.url
        }

        const payload = {
          tanggal: formData.get("tanggal"),
          nama_item: productName,
          jumlah_terjual: Number(formData.get("jumlah_terjual")),
          total_pendapatan: Number(rawPendapatan),
          keterangan: formData.get("keterangan"),
          url_nota: finalUrlNota,
        }

        const res = await fetch(`/api/jurnal/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),gst 
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Terjadi kesalahan")
        }
      } else {
        // Create mode: single FormData request (upload + save in one round-trip)
        if (selectedFile) setIsUploading(true)

        const submitForm = new FormData()
        submitForm.append("tanggal", (formData.get("tanggal") as string) || today)
        submitForm.append("nama_item", productName)
        submitForm.append("jumlah_terjual", String(formData.get("jumlah_terjual")))
        submitForm.append("total_pendapatan", rawPendapatan)
        submitForm.append("keterangan", (formData.get("keterangan") as string) || "")
        if (selectedFile) submitForm.append("file", selectedFile)

        const res = await fetch("/api/jurnal", {
          method: "POST",
          body: submitForm,
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || errorData.error || "Gagal menyimpan jurnal.")
        }
      }

      toast.success(initialData ? "Jurnal berhasil diperbarui" : "Jurnal berhasil ditambahkan")
      await expireJurnalCache()
      router.push("/admin/penjualan")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan jurnal"
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
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
            {previewUrl ? (
              <div className="relative block w-full border rounded-md overflow-hidden bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Nota Penjualan" 
                  className="w-full h-auto object-contain max-h-[600px]"
                />
                <button
                  type="button"
                  onClick={handleRemoveNota}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md z-10"
                  title="Hapus Nota"
                >
                  <Trash2 className="h-5 w-5" />
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
                <Input
                  id="nota-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadNota}
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
          {isSubmitting ? (
            isUploading ? "Mengunggah Nota..." : "Menyimpan..."
          ) : (
            initialData ? "Simpan Perubahan" : "Simpan Jurnal"
          )}
        </Button>
      </div>
    </form>
  )
}
