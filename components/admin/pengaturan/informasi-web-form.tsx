"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InformasiWebFormProps {
  initialData: Record<string, string>;
}

export function InformasiWebForm({ initialData }: InformasiWebFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    info_deskripsi: initialData.info_deskripsi || "",
    info_alamat: initialData.info_alamat || "",
    info_email: initialData.info_email || "",
    info_telepon: initialData.info_telepon || "",
    info_facebook: initialData.info_facebook || "",
    info_instagram: initialData.info_instagram || "",
    info_youtube: initialData.info_youtube || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/informasi-web", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan informasi web");
      }

      toast.success("Informasi web berhasil diperbarui.");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem saat menyimpan data.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Deskripsi Footer */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="info_deskripsi" className="text-sm font-semibold">Deskripsi Singkat (Footer)</Label>
          <Textarea 
            id="info_deskripsi" 
            name="info_deskripsi" 
            value={formData.info_deskripsi} 
            onChange={handleChange}
            placeholder="Mewujudkan lingkungan yang mandiri, sejahtera..."
            className="resize-none min-h-[100px]"
            rows={3}
          />
        </div>
        
        {/* Alamat Lengkap */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="info_alamat" className="text-sm font-semibold">Alamat Lengkap</Label>
          <Textarea 
            id="info_alamat" 
            name="info_alamat" 
            value={formData.info_alamat} 
            onChange={handleChange}
            placeholder="Contoh: Sekretariat Bintang Pertiwi, Jl. ... No. ..., Kota ..."
            className="resize-none min-h-[100px]"
            rows={3}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="info_email" className="text-sm font-semibold">Alamat Email</Label>
          <Input 
            id="info_email" 
            name="info_email" 
            type="email"
            value={formData.info_email} 
            onChange={handleChange}
            placeholder="Contoh: halo@bintangpertiwi.com"
          />
        </div>

        {/* Telepon */}
        <div className="space-y-2">
          <Label htmlFor="info_telepon" className="text-sm font-semibold">Nomor Telepon / WhatsApp</Label>
          <Input 
            id="info_telepon" 
            name="info_telepon" 
            value={formData.info_telepon} 
            onChange={handleChange}
            placeholder="Contoh: +62 812 3456 7890"
          />
        </div>

        {/* Facebook */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="info_facebook" className="text-sm font-semibold">Tautan Facebook</Label>
          <Input 
            id="info_facebook" 
            name="info_facebook" 
            type="url"
            value={formData.info_facebook} 
            onChange={handleChange}
            placeholder="Contoh: https://facebook.com/bintangpertiwi"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="info_instagram" className="text-sm font-semibold">Tautan Instagram</Label>
          <Input 
            id="info_instagram" 
            name="info_instagram" 
            type="url"
            value={formData.info_instagram} 
            onChange={handleChange}
            placeholder="Contoh: https://instagram.com/bintangpertiwi"
          />
        </div>

        {/* YouTube */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="info_youtube" className="text-sm font-semibold">Tautan YouTube</Label>
          <Input 
            id="info_youtube" 
            name="info_youtube" 
            type="url"
            value={formData.info_youtube} 
            onChange={handleChange}
            placeholder="Contoh: https://youtube.com/@bintangpertiwi"
          />
        </div>

      </div>

      <div className="pt-4 flex md:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="w-full text-base h-14">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </form>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan informasi web ini? Perubahan akan langsung tampil di situs publik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>Ya, Simpan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
