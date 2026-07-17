import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getSession } from "@/lib/auth";
import { getAllUsers } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { PenggunaManager } from "./pengguna-manager";

export const metadata = {
  title: "Manajemen Pengguna — Admin Bintang Pertiwi",
  description: "Kelola akun Super Admin dan Kontributor.",
};

export default async function PenggunaPage() {
  const session = await getSession();

  // Pertahanan berlapis: proxy sudah memblokir kontributor, tapi tetap cek di sini.
  if (!session || session.role !== "super_admin") {
    notFound();
  }

  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Manajemen Pengguna"
        description="Buat dan kelola akun Super Admin & Kontributor (pelaku UMKM)."
      />
      <PenggunaManager users={users} currentUserId={session.id} />
    </div>
  );
}
