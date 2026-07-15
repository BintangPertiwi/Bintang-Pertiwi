"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { compressImage } from "@/lib/image-compression";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function PengaduanForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const formLoadTimeRef = useRef<string>("");

  useEffect(() => {
    formLoadTimeRef.current = btoa(Date.now().toString());
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Harap unggah file berupa gambar (JPG/PNG).");
      return;
    }

    try {

      const compressed = await compressImage(selectedFile);
      setFile(compressed);


      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error("Gagal mengompres gambar:", error);
      toast.error("Gagal memproses gambar. Coba gambar lain.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (formLoadTimeRef.current) {
        formData.append("form_load_time", formLoadTimeRef.current);
      }

      const nama_lengkap = formData.get("nama_lengkap") as string;
      const status_warga = formData.get("status_warga") as string;
      const no_hp = formData.get("no_hp") as string;
      const kategori = formData.get("kategori") as string;
      const isi_laporan = formData.get("isi_laporan") as string;

      if (
        !nama_lengkap ||
        !status_warga ||
        !no_hp ||
        !kategori ||
        !isi_laporan
      ) {
        toast.error("Mohon lengkapi semua kolom yang wajib diisi.");
        setIsLoading(false);
        return;
      }

      if (nama_lengkap.length < 3) {
        toast.error("Nama lengkap minimal 3 karakter.");
        setIsLoading(false);
        return;
      }

      const nikStr = formData.get("nik") as string;
      if (nikStr && !/^\d{16}$/.test(nikStr)) {
        toast.error("NIK harus terdiri dari 16 digit angka.");
        setIsLoading(false);
        return;
      }

      if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(no_hp)) {
        toast.error(
          "Nomor HP tidak valid. Pastikan format benar (contoh: 0812...).",
        );
        setIsLoading(false);
        return;
      }

      if (isi_laporan.length < 10) {
        toast.error("Isi laporan terlalu singkat, minimal 10 karakter.");
        setIsLoading(false);
        return;
      }

      if (file) {
        formData.append("file", file);
      }

      toast.loading("Mengirim laporan ke server...", { id: "sending" });

      const res = await fetch("/api/pengaduan", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      toast.dismiss("sending");

      if (result.success) {
        toast.success("Laporan berhasil dikirim!");

        (e.target as HTMLFormElement).reset();
        setPreview(null);
        setFile(null);
      } else {
        toast.error(result.message || "Gagal mengirim laporan.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.dismiss("sending");
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl w-full">
      {/* Zero-Cost Anti-Spam Fields */}
      <div className="opacity-0 absolute -z-10 w-0 h-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website_url">Website URL</label>
        <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_lengkap"
              name="nama_lengkap"
              placeholder="Tulis nama lengkap anda..."
              minLength={3}
              maxLength={100}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nik">NIK (Opsional)</Label>
            <Input
              id="nik"
              name="nik"
              placeholder="16 digit angka..."
              minLength={16}
              maxLength={16}
              pattern="\d{16}"
              title="NIK harus terdiri dari 16 digit angka"
              inputMode="numeric"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(
                  /\D/g,
                  "",
                );
              }}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>
              Status Warga <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              defaultValue="Warga Lokal"
              name="status_warga"
              required
              disabled={isLoading}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="Warga Lokal" id="warga_lokal" />
                <Label
                  htmlFor="warga_lokal"
                  className="font-normal cursor-pointer"
                >
                  Warga Lokal
                </Label>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="Bukan Warga Lokal" id="bukan_warga" />
                <Label
                  htmlFor="bukan_warga"
                  className="font-normal cursor-pointer"
                >
                  Pengunjung
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="no_hp">
              No. HP / WhatsApp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="no_hp"
              name="no_hp"
              type="tel"
              placeholder="0812..."
              minLength={10}
              maxLength={15}
              pattern="^(\+62|62|0)8[1-9][0-9]{6,11}$"
              title="Format valid: 08xxx atau +628xxx (10-15 digit)"
              inputMode="tel"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(
                  /[^\d+]/g,
                  "",
                );
              }}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kategori">
            Kategori Pengaduan <span className="text-red-500">*</span>
          </Label>
          <Select name="kategori" required disabled={isLoading}>
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Pilih kategori laporan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Infrastruktur & Pembangunan">
                Infrastruktur & Pembangunan
              </SelectItem>
              <SelectItem value="Pelayanan Masyarakat">
                Pelayanan Masyarakat
              </SelectItem>
              <SelectItem value="Kebersihan & Lingkungan">
                Kebersihan & Lingkungan
              </SelectItem>
              <SelectItem value="Keamanan & Ketertiban">
                Keamanan & Ketertiban
              </SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="isi_laporan">
            Isi Laporan <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="isi_laporan"
            name="isi_laporan"
            placeholder="Jelaskan secara detail mengenai laporan atau keluhan Anda..."
            className="min-h-[120px]"
            minLength={10}
            maxLength={2000}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>Foto Bukti (Opsional)</Label>
          <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors text-center cursor-pointer relative overflow-hidden group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleImageChange}
              disabled={isLoading}
            />

            {preview ? (
              <div className="relative w-full aspect-video rounded-md overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium text-sm flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Ganti Foto
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
                <UploadCloud className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">
                  Klik atau Tarik Foto Kesini
                </p>
                <p className="text-xs mt-1 opacity-75">
                  Maksimal akan dikompres otomatis &lt; 500KB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim Laporan...
          </>
        ) : (
          "Kirim Pengaduan"
        )}
      </Button>
    </form>
  );
}
