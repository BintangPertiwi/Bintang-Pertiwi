import Link from "next/link";
import Image from "next/image";
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
    <footer className="relative bg-background pt-16 pb-8 lg:pt-20 border-t border-border overflow-hidden">
      {/* Background Pattern Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "linear-gradient(to right, var(--pattern-dot) 1px, transparent 1px), linear-gradient(to bottom, var(--pattern-dot) 1px, transparent 1px)",
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
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/icon.png" alt="Logo" width={28} height={28} className="rounded-full" />
              <span className="text-xl font-bold tracking-tight text-foreground">BINTANG PERTIWI</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {deskripsi}
            </p>
          </div>

          {/* Navigasi */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="font-bold text-foreground mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
              <li><Link href="/produk-umkm" className="hover:text-primary transition-colors">Produk UMKM</Link></li>
              <li><Link href="/berita" className="hover:text-primary transition-colors">Berita & Artikel</Link></li>
              <li><Link href="/galeri" className="hover:text-primary transition-colors">Galeri Foto</Link></li>
              <li><Link href="/dokumen" className="hover:text-primary transition-colors">Dokumen</Link></li>
              <li><Link href="/kontak" className="hover:text-primary transition-colors">Kontak</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div className="lg:col-span-3 lg:col-start-10">
            <h4 className="font-bold text-foreground mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
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
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-muted-foreground font-medium">
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
