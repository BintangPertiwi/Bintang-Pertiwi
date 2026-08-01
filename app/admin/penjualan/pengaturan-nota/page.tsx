import { DashboardHeader } from "@/components/admin/layout/dashboard-header"
import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context"
import { NotaSettingsForm } from "@/components/admin/penjualan/nota-settings-form"
import { getSession } from "@/lib/auth"
import { getNotaSettings } from "@/lib/db/queries/nota-settings"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Pengaturan Nota — Bintang Pertiwi",
}

export default async function PengaturanNotaPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const initialSettings = await getNotaSettings(session.id);

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Pengaturan Nota" />
      <DashboardHeader 
        title="Pengaturan Nota Penjualan" 
        description="Kustomisasi tampilan kop pada nota PDF dengan detail dan logo usaha Anda."
      />
      
      <div className="w-full">
        <NotaSettingsForm initialData={initialSettings} />
      </div>
    </div>
  )
}
