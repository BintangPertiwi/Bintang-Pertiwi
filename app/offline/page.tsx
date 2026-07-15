import { WifiOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — Bintang Pertiwi",
  description: "Anda sedang tidak terhubung ke internet.",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-muted/50 p-6 rounded-full mb-6">
        <WifiOff className="w-16 h-16 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Tidak Ada Koneksi Internet</h1>
      <p className="text-muted-foreground max-w-md">
        Sepertinya Anda sedang offline. Silakan periksa koneksi Wi-Fi atau data seluler Anda, lalu muat ulang halaman ini.
      </p>
    </div>
  );
}
