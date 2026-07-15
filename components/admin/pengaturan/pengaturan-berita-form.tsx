"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PengaturanBeritaFormProps {
  globalConfig: Record<string, string>;
}

export function PengaturanBeritaForm({ globalConfig }: PengaturanBeritaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [headerTitle, setHeaderTitle] = useState(globalConfig["berita_header_title"] || "Berita & Pengumuman");
  const [headerDesc, setHeaderDesc] = useState(globalConfig["berita_header_desc"] || "Dapatkan informasi terkini, artikel, dan pengumuman resmi seputar aktivitas masyarakat di Bintang Pertiwi.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);

    try {
      const payload = {
        berita_header_title: headerTitle,
        berita_header_desc: headerDesc,
      };

      const res = await fetch("/api/pengaturan-berita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan pengaturan");

      toast.success("Pengaturan halaman berita berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-4xl pb-20 space-y-6">
      <Accordion multiple defaultValue={["header"]} className="w-full space-y-4">
        <AccordionItem value="header" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Header Berita
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headerTitle" className="text-sm font-semibold">Judul Header</Label>
              <Input
                id="headerTitle"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                placeholder="Contoh: Berita & Pengumuman"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headerDesc" className="text-sm font-semibold">Deskripsi Header</Label>
              <Textarea
                id="headerDesc"
                value={headerDesc}
                onChange={(e) => setHeaderDesc(e.target.value)}
                placeholder="Contoh: Dapatkan informasi terkini, artikel, dan pengumuman resmi..."
                rows={3}
                required
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-8">
        <Button type="submit" disabled={isSubmitting} className="w-full px-8 text-base h-14">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyimpan Perubahan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </div>
      </form>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan Pengaturan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Ya, Simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
