"use client";

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
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserRow {
  id: number;
  username: string;
  role: string;
  nama: string;
  wa_number: string;
}

interface PenggunaManagerProps {
  users: UserRow[];
  currentUserId: number;
}

const EMPTY_FORM = {
  nama: "",
  username: "",
  wa_number: "",
  password: "",
  role: "kontributor",
};

export function PenggunaManager({ users, currentUserId }: PenggunaManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

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
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter.");
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
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/pengguna/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus akun");
      }
      toast.success(data.message);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Form tambah akun */}
      <form onSubmit={handleCreate} className="max-w-3xl space-y-6 rounded-lg border p-6">
        <h3 className="text-lg font-bold text-slate-900">Tambah Akun Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm font-semibold">Nama Lengkap</Label>
            <Input id="nama" name="nama" value={form.nama} onChange={handleChange} placeholder="Contoh: Budi Santoso" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold">Username <span className="text-red-500">*</span></Label>
            <Input id="username" name="username" value={form.username} onChange={handleChange} placeholder="Untuk login" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa_number" className="text-sm font-semibold">Nomor WhatsApp</Label>
            <Input id="wa_number" name="wa_number" inputMode="numeric" value={form.wa_number} onChange={handleChange} placeholder="Contoh: 08123456789" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">Password <span className="text-red-500">*</span></Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimal 6 karakter" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold">Peran</Label>
            <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value ?? "kontributor" }))} disabled={isSubmitting}>
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
        <Button type="submit" disabled={isSubmitting} className="h-12 px-6">
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
          {isSubmitting ? "Menyimpan..." : "Tambah Akun"}
        </Button>
      </form>

      {/* Daftar akun */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>No. WhatsApp</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nama || "—"}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge className={user.role === "super_admin" ? "bg-primary/10 text-primary hover:bg-primary/10" : "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
                    {user.role === "super_admin" ? "Super Admin" : "Kontributor"}
                  </Badge>
                </TableCell>
                <TableCell>{user.wa_number || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                    disabled={user.id === currentUserId}
                    onClick={() => setDeleteTarget(user)}
                    title={user.id === currentUserId ? "Tidak dapat menghapus akun sendiri" : "Hapus akun"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <strong>{deleteTarget?.username}</strong> akan dihapus permanen. Produk yang pernah dibuat akun ini tetap ada dan menjadi tanggung jawab Super Admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Ya, Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
