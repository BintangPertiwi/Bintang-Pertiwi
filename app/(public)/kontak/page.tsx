import { PageHeader } from "@/components/public/common/page-header";
import { KontakForm } from "@/components/public/kontak/kontak-form";
import { getGlobalConfig } from "@/lib/db/queries";
import { Mail, MapPin, Phone, User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak — Bintang Pertiwi",
  description:
    "Hubungi kontak person Bintang Pertiwi. Sampaikan pertanyaan atau keperluan Anda langsung melalui WhatsApp.",
};

export default async function KontakPage() {
  const globalConfig = await getGlobalConfig();

  const kontakNama = globalConfig["kontak_person_nama"] || "";
  const kontakJabatan = globalConfig["kontak_person_jabatan"] || "";
  const kontakWa = globalConfig["kontak_person_wa"] || "";
  const alamat = globalConfig["info_alamat"] || "";
  const email = globalConfig["info_email"] || "";
  const telepon = globalConfig["info_telepon"] || "";

  return (
    <main className="w-full bg-white min-h-screen pb-20">
      <PageHeader
        title="Hubungi Kami"
        description="Punya pertanyaan, masukan, atau ingin bekerja sama? Sampaikan langsung ke kontak person kami melalui WhatsApp."
      />

      <div className="w-full max-w-7xl mx-auto px-6 mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
                Informasi Kontak
              </h3>
              <div className="space-y-6">
                {kontakNama && (
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Kontak Person</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {kontakNama}
                        {kontakJabatan ? ` — ${kontakJabatan}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {alamat && (
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Alamat</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{alamat}</p>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                      <p className="text-sm text-slate-500 leading-relaxed break-all">{email}</p>
                    </div>
                  </div>
                )}

                {telepon && (
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Telepon</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{telepon}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <KontakForm waNumber={kontakWa} kontakNama={kontakNama} />
          </div>

        </div>
      </div>
    </main>
  );
}
