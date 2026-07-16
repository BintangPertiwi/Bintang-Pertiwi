"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface KontakPersonFormProps {
  initialData: Record<string, string>;
}

export function KontakPersonForm({ initialData }: KontakPersonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    kontak_person_nama: initialData.kontak_person_nama || "",
    kontak_person_jabatan: initialData.kontak_person_jabatan || "",
    kontak_person_wa: initialData.kontak_person_wa || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const res = await fetch("/api/kontak-person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan kontak person");
      }

      toast.success("Kontak person berhasil diperbarui.");
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="kontak_person_nama" className="text-sm font-semibold">Nama Kontak Person</Label>
            <Input
              id="kontak_person_nama"
              name="kontak_person_nama"
              value={formData.kontak_person_nama}
              onChange={handleChange}
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontak_person_jabatan" className="text-sm font-semibold">Jabatan (Opsional)</Label>
            <Input
              id="kontak_person_jabatan"
              name="kontak_person_jabatan"
              value={formData.kontak_person_jabatan}
              onChange={handleChange}
              placeholder="Contoh: Admin / Ketua Pengelola"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontak_person_wa" className="text-sm font-semibold">Nomor WhatsApp</Label>
            <Input
              id="kontak_person_wa"
              name="kontak_person_wa"
              value={formData.kontak_person_wa}
              onChange={handleChange}
              placeholder="Contoh: 08123456789"
            />
            <p className="text-xs text-muted-foreground">Nomor tujuan form kontak publik. Boleh format 08xxxx atau 628xxxx.</p>
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
              Apakah Anda yakin ingin menyimpan kontak person ini? Perubahan akan langsung tampil di halaman Kontak publik.
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
