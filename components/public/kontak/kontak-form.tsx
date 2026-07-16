"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface KontakFormProps {
  waNumber: string;
  kontakNama: string;
}

export function KontakForm({ waNumber, kontakNama }: KontakFormProps) {
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");

  const normalizedWa = waNumber.replace(/^0/, "62").replace(/\D/g, "");
  const isConfigured = normalizedWa.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
      toast.error("Nomor kontak belum diatur oleh admin.");
      return;
    }
    if (!nama.trim() || !pesan.trim()) {
      toast.error("Nama dan pesan wajib diisi.");
      return;
    }

    const sapaan = kontakNama ? `Halo ${kontakNama},` : "Halo Bintang Pertiwi,";
    const teks = `${sapaan} saya *${nama.trim()}*.\n\n${pesan.trim()}`;
    const waLink = `https://wa.me/${normalizedWa}?text=${encodeURIComponent(teks)}`;

    window.open(waLink, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-2xl">
      <div className="space-y-6">
        {!isConfigured && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>Nomor kontak belum diatur oleh admin. Form belum bisa digunakan untuk saat ini.</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="nama">
            Nama Anda <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Andi Wijaya"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pesan">
            Pesan <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="pesan"
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            placeholder="Tuliskan pertanyaan, keperluan, atau pesan Anda..."
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={!isConfigured}
          size="lg"
          className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Kirim via WhatsApp
        </Button>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Menekan tombol akan membuka WhatsApp dengan pesan Anda yang sudah terisi otomatis.
        </p>
      </div>
    </form>
  );
}
