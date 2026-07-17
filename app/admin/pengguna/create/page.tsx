import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";
import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { PenggunaForm } from "./pengguna-form";

export const metadata = {
  title: "Tambah Akun Baru — Bintang Pertiwi",
};

export default function CreatePenggunaPage() {
  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Tambah Akun" />
      <DashboardHeader
        title="Tambah Akun Baru"
        description="Daftarkan pengguna baru sebagai Super Admin atau Kontributor."
      />

      <PenggunaForm />
    </div>
  );
}
