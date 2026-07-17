"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const EMPTY_FORM = {
  nama: "",
  username: "",
  wa_number: "",
  password: "",
  role: "kontributor",
};

export function PenggunaForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      toast.error("Username dan password wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat akun");
      }
      toast.success(data.message);
      
      router.push("/admin/pengguna");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="max-w-3xl space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2">
          <Label htmlFor="nama" className="text-sm font-semibold">Nama Lengkap</Label>
          <Input 
            id="nama" 
            name="nama" 
            value={form.nama} 
            onChange={handleChange} 
            placeholder="Contoh: Budi Santoso" 
            disabled={isSubmitting} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-semibold">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="username" 
            name="username" 
            value={form.username} 
            onChange={handleChange} 
            placeholder="Untuk login" 
            disabled={isSubmitting} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="wa_number" className="text-sm font-semibold">Nomor WhatsApp</Label>
          <Input 
            id="wa_number" 
            name="wa_number" 
            inputMode="numeric" 
            value={form.wa_number} 
            onChange={handleChange} 
            placeholder="Contoh: 08123456789" 
            disabled={isSubmitting} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Minimal 6 karakter" 
            disabled={isSubmitting} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-semibold">Peran</Label>
          <Select 
            value={form.role} 
            onValueChange={(value) => setForm((prev) => ({ ...prev, role: value ?? "kontributor" }))} 
            disabled={isSubmitting}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Pilih peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kontributor">Kontributor (UMKM)</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pt-4 flex flex-col sm:flex-row gap-3 md:col-span-2">
        <Button 
          type="button" 
          variant="destructive" 
          disabled={isSubmitting} 
          onClick={() => router.push("/admin/pengguna")}
          className="w-full sm:w-auto text-base h-14 order-2 sm:order-1"
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full sm:flex-1 text-base h-14 order-1 sm:order-2"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
          ) : (
            <><UserPlus className="mr-2 h-5 w-5" /> Tambah Akun</>
          )}
        </Button>
      </div>
    </form>
  );
}
