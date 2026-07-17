import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { getSession } from "@/lib/auth";
import { getAdminById } from "@/lib/db/queries";
import { PengaturanForm } from "./pengaturan-form";

export default async function PengaturanPage() {
  const session = await getSession();
  const user = session ? await getAdminById(session.id) : undefined;

  const currentUsername = user?.username || session?.username || "admin";
  const currentWa = user?.wa_number || "";
  const role = session?.role || "super_admin";

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Pengaturan Akun"
        description="Kelola nomor WhatsApp, username, dan password akun Anda."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PengaturanForm initialUsername={currentUsername} initialWa={currentWa} role={role} />
      </div>
    </div>
  );
}
