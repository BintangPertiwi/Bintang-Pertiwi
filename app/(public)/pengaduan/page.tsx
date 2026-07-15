import { PageHeader } from "@/components/public/common/page-header";
import { PengaduanForm } from "@/components/public/pengaduan/pengaduan-form";
import { Info, ShieldCheck, Zap, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaduan Warga — Bintang Pertiwi",
  description:
    "Layanan pengaduan masyarakat Bintang Pertiwi yang terintegrasi langsung dengan sistem notifikasi Pengelola.",
};

export default function PengaduanPage() {
  return (
    <main className="w-full bg-white min-h-screen pb-20">
      <PageHeader
        title="Layanan Pengaduan Warga"
        description="Sampaikan laporan, keluhan, atau aspirasi Anda. Setiap laporan yang masuk akan langsung dikirimkan secara real-time ke ponsel cerdas Perangkat Bintang Pertiwi."
      />

      <div className="w-full max-w-7xl mx-auto px-6 mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-10">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
                Informasi Layanan
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Respon Cepat (Real-time)
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Laporan Anda akan langsung terkirim sebagai notifikasi ke
                      perangkat komunikasi cerdas Pengelola saat itu juga.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Transparan & Terpantau
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Laporan tercatat otomatis dalam sistem administrasi
                      untuk dipantau dan dievaluasi penyelesaiannya.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Terbuka Untuk Semua
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Baik Warga Lokal maupun Pengunjung (wisatawan/tamu) dari
                      luar daerah dipersilakan untuk melapor jika menemukan
                      masalah atau memiliki keluhan di Bintang Pertiwi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-slate-400 shrink-0" />
                <p className="text-sm text-slate-500 leading-relaxed">
                  <strong className="text-slate-900">Privasi Terjaga:</strong>{" "}
                  Data NIK dan Nomor Telepon Anda hanya dapat dilihat oleh
                  internal Pengelola dan dijamin kerahasiaannya.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <PengaduanForm />
          </div>
        </div>
      </div>
    </main>
  );
}
