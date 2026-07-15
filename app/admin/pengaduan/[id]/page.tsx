import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { StatusUpdaterDetail } from "@/components/admin/pengaduan/status-updater-detail";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { getPengaduanById } from "@/lib/google-sheets";
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/admin/layout/breadcrumb-context";

export const metadata = {
  title: "Detail Pengaduan — Admin Bintang Pertiwi",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Menunggu":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Diproses":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Selesai":
      return "bg-green-100 text-green-800 border-green-200";
    case "Ditolak":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default async function DetailPengaduanPage({ params }: PageProps) {
  const { id } = await params;
  const pengaduan = await getPengaduanById(id);

  if (!pengaduan) {
    notFound();
  }

  const isWargaLokal = pengaduan.status_warga === "Warga Lokal" || pengaduan.status_warga === "Warga";
  const formattedDate = new Date(pengaduan.tanggal).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="flex flex-col gap-6">
      <SetBreadcrumb label="Detail Pengaduan" />
      
      <div className="flex items-center gap-4">
        <Link href="/admin/pengaduan">
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 bg-white border-none">
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Button>
        </Link>
        <DashboardHeader 
          title="Detail Pengaduan" 
          description={`ID Laporan: ${pengaduan.id}`}
        />
      </div>

      <div className="max-w-3xl space-y-6 pb-20">
        <Accordion multiple defaultValue={["laporan", "pelapor", "catatan"]} className="w-full space-y-4">
          
          {/* SECTION: LAPORAN */}
          <AccordionItem value="laporan" className="border-b pb-4">
            <AccordionTrigger className="text-xl font-bold hover:no-underline">
              <div className="flex items-start justify-between w-full pr-4 text-left">
                <div className="w-full">
                  <span className="text-xl">{pengaduan.kategori}</span>
                  <CardDescription className="flex items-center mt-2 text-sm font-normal justify-between w-full">
                    <span className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
                      {formattedDate}
                    </span>
                    <Badge className={getStatusColor(pengaduan.status)} variant="outline">
                      {pengaduan.status}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Isi Laporan Warga</h3>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {pengaduan.isi_laporan}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SECTION: INFORMASI PELAPOR */}
          <AccordionItem value="pelapor" className="border-b pb-4">
            <AccordionTrigger className="text-xl font-bold hover:no-underline">
              Informasi Pelapor
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 opacity-70 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{pengaduan.nama_lengkap}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">NIK: {pengaduan.nik || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 opacity-70 shrink-0" />
                    <div>
                      {isWargaLokal ? (
                         <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">🏡 Warga Lokal</Badge>
                      ) : (
                         <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">🧳 Pengunjung</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-1 opacity-70 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Nomor HP / WhatsApp</p>
                      {pengaduan.no_hp ? (
                        <a href={`https://wa.me/${pengaduan.no_hp.replace(/^0/, '62').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium mt-0.5 block">
                          {pengaduan.no_hp}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground block mt-0.5">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SECTION: CATATAN ADMIN */}
          <AccordionItem value="catatan" className="border-b pb-4">
            <AccordionTrigger className="text-xl font-bold hover:no-underline text-slate-700">
              Catatan Admin
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-4 border border-dashed rounded-md">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Catatan Admin:</strong> Foto bukti dari pengaduan ini telah diteruskan secara otomatis ke grup Telegram saat laporan dibuat.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>

        <StatusUpdaterDetail id={pengaduan.id} currentStatus={pengaduan.status} />
      </div>
    </div>
  );
}
