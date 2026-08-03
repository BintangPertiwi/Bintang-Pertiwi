"use client"

import { expireJurnalCache } from "@/app/actions/jurnal"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { compressImage } from "@/lib/image-compression"
import { cn } from "@/lib/utils"
import type { JurnalRow } from "@/types"
import { Check, ChevronsUpDown, ImagePlus, Loader2, Plus, Trash2, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

interface ProductItem {
  id: string;
  nama: string;
  harga: number;
  satuan: string;
}

interface FormItem {
  id: string;
  produk_id: string | null;
  nama_item: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
  satuan: string;
}

function ProductCombobox({ 
  value, 
  products, 
  onChange 
}: { 
  value: string; 
  products: ProductItem[]; 
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  
  // Also include custom products that might be set but not in existing list
  const allProducts = React.useMemo(() => {
    const list = [...products];
    if (value && !list.some(p => p.nama === value)) {
      list.push({ id: `custom-${value}`, nama: value, harga: 0, satuan: "" });
    }
    return list;
  }, [products, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger 
        render={
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open} 
            className={cn("w-full justify-between font-normal bg-background h-11", !value && "text-muted-foreground")}
          />
        }
      >
        {value || "Pilih atau ketik produk..."}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari produk..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>
              <Button
                type="button" variant="ghost" className="w-full justify-start text-sm px-2 py-1.5 h-auto"
                onClick={() => {
                  const newProd = search.trim();
                  if (newProd) {
                    onChange(newProd);
                    setOpen(false);
                    setSearch("");
                  }
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Buat &quot;{search.trim()}&quot;
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {allProducts.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.nama}
                  onSelect={() => {
                    onChange(p.nama);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === p.nama ? "opacity-100" : "opacity-0")} />
                  {p.nama}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function JurnalForm({ initialData, existingProducts = [] }: { initialData?: JurnalRow, existingProducts?: ProductItem[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [urlNota, setUrlNota] = React.useState(initialData?.url_nota || "")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState(initialData?.url_nota || "")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  const [items, setItems] = React.useState<FormItem[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map(i => ({ ...i, id: i.id || crypto.randomUUID(), satuan: i.satuan || "" }));
    } else if (initialData) {
      return [{
        id: crypto.randomUUID(),
        produk_id: null,
        nama_item: initialData.nama_item,
        harga_satuan: 0,
        jumlah: initialData.jumlah_terjual,
        subtotal: initialData.total_pendapatan,
        satuan: "",
      }];
    }
    return [{ id: crypto.randomUUID(), produk_id: null, nama_item: "", harga_satuan: 0, jumlah: 1, subtotal: 0, satuan: "" }];
  });

  const today = new Date().toISOString().split('T')[0]

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (file: File) => {
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
    if (file) handleFileChange(file)
  }

  const handleRemoveNota = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl("")
    setSelectedFile(null)
    setUrlNota("")
  }

  const handleAddItem = () => {
    if (items.length >= 20) {
      toast.error("Maksimal 20 item per transaksi.");
      return;
    }
    setItems([...items, { id: crypto.randomUUID(), produk_id: null, nama_item: "", harga_satuan: 0, jumlah: 1, subtotal: 0, satuan: "" }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error("Minimal harus ada 1 item transaksi.");
      return;
    }
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof FormItem, value: string | number | null) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        if (field === 'nama_item') {
          const prod = existingProducts.find(p => p.nama === value);
          if (prod) {
            updated.produk_id = prod.id;
            updated.harga_satuan = prod.harga;
            updated.satuan = prod.satuan || "";
          } else {
            updated.produk_id = null;
          }
        }
        
        if (field === 'harga_satuan' || field === 'jumlah' || field === 'nama_item') {
          updated.subtotal = updated.harga_satuan * updated.jumlah;
        }
        return updated;
      }
      return item;
    }));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const isValid = items.every(i => i.nama_item.trim() !== "" && i.jumlah > 0 && i.harga_satuan >= 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid) {
      toast.error("Silakan lengkapi semua data item dengan benar.");
      return;
    }

    setIsSubmitting(true)
    const formElement = e.currentTarget;

    try {
      const formData = new FormData(formElement)

      const fileToUpload = selectedFile
        ? await compressImage(selectedFile, 1600, 1600, 0.75)
        : null;

      const submitForm = new FormData()
      submitForm.append("tanggal", (formData.get("tanggal") as string) || today)
      submitForm.append("keterangan", (formData.get("keterangan") as string) || "")
      submitForm.append("url_nota", fileToUpload ? "" : urlNota)
      submitForm.append("items", JSON.stringify(items.map(({ id, ...rest }) => rest)))
      
      if (fileToUpload) {
        submitForm.append("file", fileToUpload)
        setIsUploading(true)
      }
      
      if (initialData) {
        submitForm.append("isEdit", "true")
        const res = await fetch(`/api/jurnal/${initialData.id}`, {
          method: "PUT",
          body: submitForm,
        })
        if (!res.ok) throw new Error((await res.json()).message || "Terjadi kesalahan")
      } else {
        const res = await fetch("/api/jurnal", {
          method: "POST",
          body: submitForm,
        })
        if (!res.ok) throw new Error((await res.json()).message || "Gagal menyimpan jurnal.")
      }

      toast.success(initialData ? "Jurnal berhasil diperbarui" : "Jurnal berhasil ditambahkan")
      if (formElement) formElement.reset()
      await expireJurnalCache()
      router.push("/admin/penjualan")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan jurnal"
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 pb-20">
      <div className="space-y-6">
        
        <div className="space-y-2">
          <Label htmlFor="tanggal" className="text-sm font-semibold">
            Tanggal Transaksi <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            id="tanggal"
            name="tanggal"
            type="date"
            required
            defaultValue={initialData?.tanggal ? initialData.tanggal.split('T')[0] : today}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Daftar Item Transaksi</Label>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-4 relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(item.id)} 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <Label>Nama Produk <span className="text-red-500 ml-0.5">*</span></Label>
                  <ProductCombobox 
                    value={item.nama_item} 
                    products={existingProducts} 
                    onChange={(val) => handleUpdateItem(item.id, 'nama_item', val)} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Harga Satuan <span className="text-red-500 ml-0.5">*</span></Label>
                    <CurrencyInput 
                      value={String(item.harga_satuan)}
                      onChange={(val) => handleUpdateItem(item.id, 'harga_satuan', Number(val) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qty {item.satuan ? `(${item.satuan})` : ""} <span className="text-red-500 ml-0.5">*</span></Label>
                    <Input 
                      type="number" min="1" 
                      value={item.jumlah || ""}
                      onChange={(e) => handleUpdateItem(item.id, 'jumlah', Number(e.target.value) || 0)}
                      placeholder="1"
                    />
                  </div>
                </div>
                
                <div className="pt-3 flex justify-between items-center border-t border-dashed">
                  <span className="font-semibold text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-primary">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))}
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-dashed" 
            onClick={handleAddItem}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Item Lain
          </Button>

          <div className="p-4 bg-muted/30 border rounded-lg flex items-center justify-between">
            <span className="font-bold text-lg">Grand Total</span>
            <span className="font-bold text-xl text-primary">Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keterangan" className="text-sm font-semibold">Keterangan (Opsional)</Label>
          <Textarea
            id="keterangan"
            name="keterangan"
            placeholder="Catatan tambahan seperti nama pembeli, platform, atau metode pembayaran..."
            defaultValue={initialData?.keterangan}
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Gambar Nota (Opsional)</Label>
          <div className="relative group mt-1">
            {previewUrl ? (
              <div className="relative block w-full border rounded-md overflow-hidden bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Nota Penjualan" 
                  className="w-full h-auto object-contain max-h-[400px]"
                />
                <button
                  type="button"
                  onClick={handleRemoveNota}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md z-10 cursor-pointer"
                  title="Hapus Nota"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="nota-file"
                className={`flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-md cursor-pointer overflow-hidden transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent hover:border-slate-400/80 hover:bg-muted"
                }`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop={(e) => {
                  e.preventDefault(); e.stopPropagation(); setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileChange(file);
                }}
              >
                <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                  <div className="flex gap-4 items-center mb-2 text-muted-foreground">
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
          className="w-full sm:w-auto text-base h-12 order-2 sm:order-1"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !isValid}
          className="w-full sm:flex-1 text-base h-12 order-1 sm:order-2"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{isUploading ? "Mengunggah Nota..." : "Menyimpan..."}</>
          ) : (
            initialData ? "Simpan Perubahan" : "Simpan Jurnal"
          )}
        </Button>
      </div>
    </form>
  )
}
