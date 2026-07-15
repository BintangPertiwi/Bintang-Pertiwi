import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { CopyrightYear } from "./copyright-year";
import { getGlobalConfig } from "@/lib/db/queries";

export async function Footer() {
  const globalConfig = await getGlobalConfig();
  
  const deskripsi = globalConfig["info_deskripsi"] || "Mewujudkan lingkungan yang mandiri, sejahtera, dan berbudaya melalui transparansi informasi dan pelayanan digital terpadu untuk seluruh warga.";
  const alamat = globalConfig["info_alamat"] || "Balai Bintang Pertiwi, Tidore Kepulauan, Maluku Utara";
  const email = globalConfig["info_email"] || "halo@bintangpertiwi.com";
  const telepon = globalConfig["info_telepon"] || "+62 812 3456 7890";

  return (
    <footer className="relative bg-white pt-16 pb-8 lg:pt-20 border-t border-slate-200 overflow-hidden">
      {/* Background Pattern Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        }}
      />
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">

        {/* Main Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-12 lg:mb-16">
          
          {/* Brand/Typography */}
          <div className="lg:col-span-5 lg:pr-12">
            <Link href="/" className="flex items-center gap-1.5 mb-4">
              <div className="grid grid-cols-2 gap-0.5">
                <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                <span className="w-2.5 h-2.5 bg-primary/70 rounded-full"></span>
                <span className="w-2.5 h-2.5 bg-primary/50 rounded-full col-span-2 mx-auto"></span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">BINTANG PERTIWI</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {deskripsi}
            </p>
          </div>

          {/* Navigasi */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
              <li><Link href="/profil" className="hover:text-primary transition-colors">Profil</Link></li>
              <li><Link href="/berita" className="hover:text-primary transition-colors">Berita & Artikel</Link></li>
              <li><Link href="/galeri" className="hover:text-primary transition-colors">Galeri Foto</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h4 className="font-bold text-slate-900 mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="leading-relaxed">{alamat}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>{telepon}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom: Copyright & Legal */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-slate-500 font-medium">
          <p>© <CopyrightYear /> Bintang Pertiwi. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
            <Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
