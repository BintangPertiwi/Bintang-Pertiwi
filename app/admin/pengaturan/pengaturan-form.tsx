"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StorageManagement } from "./storage-management";
import { BackupRestoreSection } from "./backup-restore-section";

interface PengaturanFormProps {
  initialUsername: string;
  initialWa: string;
  role: string;
}

interface UpdatePayload {
  newUsername?: string;
  oldPassword?: string;
  newPassword?: string;
}

export function PengaturanForm({ initialUsername, initialWa, role }: PengaturanFormProps) {
  const router = useRouter();

  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [waNumber, setWaNumber] = useState(initialWa);

  const [usernameData, setUsernameData] = useState({
    newUsername: initialUsername,
    oldPassword: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsernameData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const submitUpdate = async (payload: UpdatePayload, setLoading: (state: boolean) => void) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui pengaturan");
      }

      toast.success(data.message);
      
      // Redirect ke halaman login karena sesi direset jika berhasil
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameData.newUsername || !usernameData.oldPassword) {
      toast.error("Harap isi username dan password saat ini!");
      return;
    }
    await submitUpdate(
      { newUsername: usernameData.newUsername, oldPassword: usernameData.oldPassword },
      setIsUsernameLoading
    );
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter.");
      return;
    }

    await submitUpdate(
      { newUsername: initialUsername, oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },
      setIsPasswordLoading
    );
  };

  // Update nomor WA tidak mereset sesi (tidak perlu login ulang).
  const handleWaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWaLoading(true);
    try {
      const res = await fetch("/api/akun/wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wa_number: waNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan nomor WhatsApp");
      }
      toast.success(data.message);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsWaLoading(false);
    }
  };

  return (
    <div className="max-w-3xl pb-20">
      <Accordion multiple defaultValue={["wa", "username", "password", "storage", "backup"]} className="w-full space-y-4">

        {/* SECTION 0: NOMOR WHATSAPP */}
        <AccordionItem value="wa" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Nomor WhatsApp
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <form onSubmit={handleWaSubmit} className="space-y-6">
              <p className="text-sm text-muted-foreground mb-2">
                Nomor ini menjadi tujuan tombol &quot;Pesan via WA&quot; pada produk yang Anda tambahkan. Boleh format 08xxxx atau 628xxxx.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="waNumber" className="text-sm font-semibold">
                    Nomor WhatsApp
                  </label>
                  <Input
                    id="waNumber"
                    name="waNumber"
                    inputMode="numeric"
                    placeholder="Contoh: 08123456789"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    disabled={isWaLoading}
                  />
                </div>
                <div className="pt-4 flex md:col-span-2">
                  <Button type="submit" disabled={isWaLoading} className="w-full px-8 text-base h-14">
                    {isWaLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyimpan...</>
                    ) : (
                      <><Save className="mr-2 h-5 w-5" />Simpan Nomor WA</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 1: UPDATE USERNAME */}
        <AccordionItem value="username" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Perbarui Username
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <p className="text-sm text-muted-foreground mb-2">
                Ganti username yang digunakan untuk login. Anda tetap perlu mengkonfirmasi menggunakan password saat ini.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="newUsername" className="text-sm font-semibold flex items-center gap-2">
                    Username Baru <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="newUsername"
                    name="newUsername"
                    placeholder="Masukkan username baru"
                    value={usernameData.newUsername}
                    onChange={handleUsernameChange}
                    required
                    disabled={isUsernameLoading}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="oldPasswordUsername" className="text-sm font-semibold">
                    Password Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="oldPasswordUsername"
                    name="oldPassword"
                    type="password"
                    placeholder="Masukkan password untuk konfirmasi"
                    value={usernameData.oldPassword}
                    onChange={handleUsernameChange}
                    required
                    disabled={isUsernameLoading}
                  />
                </div>

                <div className="pt-4 flex md:col-span-2">
                  <Button type="submit" disabled={isUsernameLoading} className="w-full px-8 text-base h-14">
                    {isUsernameLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyimpan...</>
                    ) : (
                      <><Save className="mr-2 h-5 w-5" />Simpan Username</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 2: UPDATE PASSWORD */}
        <AccordionItem value="password" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Perbarui Password
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <p className="text-sm text-muted-foreground mb-2">
                Ganti password akun Anda untuk menjaga keamanan sistem.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="oldPasswordPass" className="text-sm font-semibold">
                    Password Lama <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="oldPasswordPass"
                    name="oldPassword"
                    type="password"
                    placeholder="Masukkan password saat ini"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={isPasswordLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-semibold">
                    Password Baru <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={isPasswordLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Ulangi password baru"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={isPasswordLoading}
                  />
                </div>

                <div className="pt-4 flex md:col-span-2">
                  <Button type="submit" disabled={isPasswordLoading} className="w-full px-8 text-base h-14">
                    {isPasswordLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Menyimpan...</>
                    ) : (
                      <><Save className="mr-2 h-5 w-5" />Simpan Password</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 3: STORAGE MANAGEMENT (khusus Super Admin) */}
        {role === "super_admin" && (
          <AccordionItem value="storage" className="border-b pb-4">
            <AccordionTrigger className="text-xl font-bold hover:no-underline text-red-700">
              Manajemen Penyimpanan
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Alat pembersih ini berguna untuk menghapus sisa-sisa gambar sampah (yatim piatu) di Database akibat peramban tertutup sebelum artikel sempat disimpan. Hanya gambar yang usianya lebih dari 24 jam yang akan dipindai dan dibersihkan dari Database.
                </p>
                <StorageManagement />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* SECTION 4: BACKUP & RESTORE (khusus Super Admin) */}
        {role === "super_admin" && (
          <AccordionItem value="backup" className="border-b pb-4">
            <AccordionTrigger className="text-xl font-bold hover:no-underline">
              Backup & Restore
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <BackupRestoreSection />
            </AccordionContent>
          </AccordionItem>
        )}

      </Accordion>
    </div>
  );
}
