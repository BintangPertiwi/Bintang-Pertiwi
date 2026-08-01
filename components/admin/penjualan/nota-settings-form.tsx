"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { compressImage } from "@/lib/image-compression"
import type { NotaSettingsRow } from "@/types/db"
import { ImagePlus, Loader2, RefreshCcw, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

interface NotaSettingsFormProps {
  initialData: NotaSettingsRow;
}

export function NotaSettingsForm({ initialData }: NotaSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const [namaUsaha, setNamaUsaha] = React.useState(initialData.nama_usaha);
  const [alamat, setAlamat] = React.useState(initialData.alamat);
  const [nomorTelepon, setNomorTelepon] = React.useState(initialData.nomor_telepon);
  
  const [urlLogo, setUrlLogo] = React.useState(initialData.url_logo);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState(initialData.url_logo);

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file logo maksimal 2MB.");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setSelectedFile(file);
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemoveLogo = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
    setUrlLogo("");
  };

  const handleResetToDefault = () => {
    setPreviewUrl("/icon.png");
    setSelectedFile(null);
    setUrlLogo("/icon.png");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fileToUpload = selectedFile
        ? await compressImage(selectedFile, 800, 800, 0.8)
        : null;

      const submitForm = new FormData();
      submitForm.append("nama_usaha", namaUsaha);
      submitForm.append("alamat", alamat);
      submitForm.append("nomor_telepon", nomorTelepon);
      
      if (fileToUpload) {
        submitForm.append("file", fileToUpload);
      } else {
        submitForm.append("url_logo", urlLogo);
      }

      const res = await fetch("/api/nota-settings", {
        method: "POST",
        body: submitForm,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan pengaturan");
      }

      toast.success("Pengaturan nota berhasil disimpan");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_usaha" className="font-semibold">Nama Usaha / UMKM</Label>
            <Input
              id="nama_usaha"
              value={namaUsaha}
              onChange={(e) => setNamaUsaha(e.target.value)}
              placeholder="Contoh: Kopi Bubuk Bintang"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat" className="font-semibold">Alamat Usaha</Label>
            <Textarea
              id="alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomor_telepon" className="font-semibold">Nomor Telepon / WA</Label>
            <Input
              id="nomor_telepon"
              value={nomorTelepon}
              onChange={(e) => setNomorTelepon(e.target.value)}
              placeholder="Contoh: 081234567890"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Logo UMKM</Label>
              <Button type="button" variant="ghost" size="sm" onClick={handleResetToDefault} className="text-xs">
                <RefreshCcw className="w-3 h-3 mr-1" /> Pakai Default
              </Button>
            </div>
            
            <div className="relative group mt-1">
              {previewUrl ? (
                <div className="relative flex w-full h-40 border rounded-md overflow-hidden bg-muted/20 items-center justify-center">
                  <div className="relative w-24 h-24">
                    <Image 
                      src={previewUrl} 
                      alt="Logo Nota" 
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors shadow-md z-10"
                    title="Hapus Logo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="logo-file"
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
                      Geser & Lepas logo disini
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Format didukung: JPG, JPEG, PNG. Maks: 2MB.
                    </p>
                  </div>
                  <Input
                    id="logo-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadLogo}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Pengaturan"}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col items-center p-6 text-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider w-full text-center border-b pb-2">
            Preview Header Nota
          </p>
          
          <div className="w-full max-w-[280px] bg-white text-center flex flex-col items-center gap-3 mt-4">
            {previewUrl ? (
              <div className="relative w-16 h-16">
                <Image src={previewUrl} alt="Logo" fill className="object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-300">
                <ImagePlus className="w-6 h-6" />
              </div>
            )}
            
            <div className="flex flex-col gap-1 w-full">
              <h3 className="font-bold text-lg text-slate-900 break-words leading-tight">
                {namaUsaha || "NAMA USAHA"}
              </h3>
              <p className="text-[11px] text-slate-600 leading-snug">
                {alamat || "Alamat usaha akan tampil di sini..."}
              </p>
              {nomorTelepon && (
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Telp/WA: {nomorTelepon}
                </p>
              )}
            </div>
            
            <div className="w-full border-t border-dashed border-slate-300 mt-4 pt-4">
              <h4 className="font-bold text-sm">NOTA PENJUALAN</h4>
              <p className="text-[10px] text-slate-500">No: INV-20260801-XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
