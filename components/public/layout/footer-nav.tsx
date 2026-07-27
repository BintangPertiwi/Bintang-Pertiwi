"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { label: "Beranda", href: "/" },
  { label: "Produk UMKM", href: "/produk-umkm" },
  { label: "Berita & Artikel", href: "/berita" },
  { label: "Galeri Foto", href: "/galeri" },
  { label: "Dokumen", href: "/dokumen" },
  { label: "Kontak", href: "/kontak" },
  { label: "Tim Pengembang", href: "/tim-pengembang" },
];

export function FooterNav() {
  const pathname = usePathname();
  const safePathname = pathname || "/";

  return (
    <ul className="space-y-4 text-sm font-medium text-muted-foreground">
      {footerLinks.map((link) => {
        const isActive = link.href === "/" 
          ? safePathname === link.href 
          : safePathname.startsWith(link.href);

        return (
          <li key={link.href}>
            <Link 
              href={link.href} 
              className={`transition-colors ${isActive ? 'text-primary' : 'hover:text-primary'}`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
