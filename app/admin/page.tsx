import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStorageUsage } from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";
import { getTotalBerita, getTotalGaleri } from "@/lib/db/queries";
import { getJurnalChartData } from "@/lib/db/queries/jurnal";
import { JurnalChart } from "@/app/admin/penjualan/jurnal-chart";
import {
  BadgeInfo,
  Database,
  FileText,
  Image as ImageIcon,
  Info,
  PlusCircle,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { StorageManagement } from "./pengaturan/storage-management";
import { RefreshStorageButton } from "@/components/admin/refresh-storage-button";

export default async function AdminDashboardPage() {
  const session = await getSession();
  const isSuperAdmin = session?.role === "super_admin";

  const ownerId = session?.role === "kontributor" ? session.id : undefined;

  // Statistik & storage
  const [totalBerita, totalGaleri, chartData] = await Promise.all([
    isSuperAdmin ? getTotalBerita() : 0,
    isSuperAdmin ? getTotalGaleri() : 0,
    getJurnalChartData({ ownerId })
  ]);

  // Non-blocking: jangan biarkan Cloudinary timeout memblokir seluruh dashboard
  const storageBytes = isSuperAdmin
    ? await Promise.race([
        getStorageUsage(),
        new Promise<number>((resolve) => setTimeout(() => resolve(0), 2000)),
      ])
    : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formattedStorage = formatBytes(storageBytes);
  const percentUsed = ((storageBytes / (15 * 1024 * 1024 * 1024)) * 100).toFixed(2);

  return (
    <div className="space-y-8 pb-10 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {isSuperAdmin
            ? "Pusat kontrol Web Profil dan Sistem Informasi Program PPM Bintang Pertiwi Pertamina EP Sangatta."
            : `Selamat datang, ${session?.username ?? "Kontributor"}. Kelola produk UMKM Anda dari sini.`}
        </p>
      </div>

      {/* Row 1: Quick Stats — Super Admin only */}
      {isSuperAdmin && (
        <div className="grid gap-6 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
          <Card className="bg-transparent rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Berita</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalBerita}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Artikel telah dipublikasikan
              </p>
            </CardContent>
          </Card>
          <Card className="bg-transparent rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Galeri</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGaleri}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Foto/kegiatan
              </p>
            </CardContent>
          </Card>
          <Card className="bg-transparent rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penyimpanan</CardTitle>
              <Database className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary flex items-center justify-between">
                <span>{formattedStorage}</span>
                <RefreshStorageButton />
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>Batas Kapasitas: 15 GB</span>
                <span className="font-semibold">{percentUsed}% Terpakai</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Insight Chart */}
      {chartData && (chartData.pieData.length > 0 || chartData.lineData.length > 0) && (
        <Card className="bg-transparent rounded-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Ringkasan Pendapatan</CardTitle>
            <p className="text-sm text-muted-foreground">Distribusi pendapatan penjualan produk {isSuperAdmin ? "semua UMKM" : "Anda"}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <JurnalChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {/* Row 2: Quick Actions — berbeda per role */}
      {isSuperAdmin ? (
        <div className="grid gap-4 mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-3">
          <Link href="/admin/berita/create" className={buttonVariants({ size: "lg", className: "w-full h-14 flex flex-row gap-2 items-center justify-center shadow-sm" })}>
            <PlusCircle className="h-5 w-5" />
            <span className="font-semibold text-base">Tulis Berita</span>
          </Link>
          <Link href="/admin/galeri/create" className={buttonVariants({ size: "lg", className: "w-full h-14 flex flex-row gap-2 items-center justify-center shadow-sm" })}>
            <ImageIcon className="h-5 w-5" />
            <span className="font-semibold text-base">Unggah Galeri</span>
          </Link>
          <Link href="/admin/informasi-web" className={buttonVariants({ size: "lg", className: "w-full h-14 flex flex-row gap-2 items-center justify-center shadow-sm" })}>
            <BadgeInfo className="h-5 w-5" />
            <span className="font-semibold text-base">Informasi Web</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-2">
          <Link href="/admin/produk/create" className={buttonVariants({ size: "lg", className: "w-full h-14 flex flex-row gap-2 items-center justify-center shadow-sm" })}>
            <PlusCircle className="h-5 w-5" />
            <span className="font-semibold text-base">Tambah Produk</span>
          </Link>
          <Link href="/admin/produk" className={buttonVariants({ size: "lg", variant: "outline", className: "w-full h-14 flex flex-row gap-2 items-center justify-center shadow-sm" })}>
            <ShoppingBag className="h-5 w-5" />
            <span className="font-semibold text-base">Lihat Produk Saya</span>
          </Link>
        </div>
      )}

      {/* Row 3: Guide & Warnings */}
      <div className="grid gap-6">
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Pusat Panduan & Tutorial</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Panduan lengkap mengelola sistem informasi.
          </p>
          <div className="w-full">
            <Accordion multiple defaultValue={isSuperAdmin ? ["item-1", "item-2", "item-3", "item-4", "item-5", "item-6"] : ["item-3", "item-5"]} className="w-full space-y-4">
              
              {isSuperAdmin && (
                <AccordionItem value="item-1" className="border-b pb-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline">
                    1. Tips Kualitas & Ukuran Gambar Galeri
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 text-muted-foreground leading-relaxed text-base">
                    Gunakan gambar berorientasi <i>landscape</i> (mendatar, bukan potret berdiri) agar proporsional di kartu halaman muka. Kompres ukuran gambar Anda di bawah <b>2MB</b> (rekomendasi: format WebP atau JPG) agar halaman situs tetap memuat secepat kilat untuk warga dengan koneksi internet terbatas.
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {isSuperAdmin && (
                <AccordionItem value="item-2" className="border-b pb-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline">
                    2. Aturan Penulisan Berita
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 text-muted-foreground leading-relaxed text-base">
                    Kolom ringkasan digunakan sebagai teks pratinjau (preview) di halaman muka. Tulislah maksimal <b>2 hingga 3 kalimat padat</b> yang mengundang rasa penasaran pembaca, jangan memasukkan seluruh paragraf pertama ke dalamnya. Saat menulis isi, manfaatkan fitur <i>Bold</i> dan <i>Italic</i> untuk menekankan informasi penting.
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="item-3" className="border-b pb-4">
                <AccordionTrigger className="text-lg font-bold hover:no-underline">
                  {isSuperAdmin ? "3. " : "1. "}Mengelola Produk UMKM
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6 text-muted-foreground leading-relaxed text-base">
                  Untuk menambah, mengubah, atau menghapus produk yang tampil di katalog publik, buka menu <b>Produk</b> di panel samping (sidebar). Unggah minimal satu gambar (gambar pertama menjadi <i>thumbnail</i>), lalu isi nama, harga, kategori, dan ketersediaan stok. Gambar otomatis dikompres sebelum diunggah agar hemat penyimpanan.
                  {!isSuperAdmin && (
                    <span className="block mt-2">
                      Sebagai Kontributor, Anda hanya dapat mengelola produk yang <b>Anda buat sendiri</b>. Pastikan mengisi nomor WhatsApp di <b>Pengaturan</b> agar pembeli dapat menghubungi Anda langsung.
                    </span>
                  )}
                </AccordionContent>
              </AccordionItem>
              
              {isSuperAdmin && (
                <AccordionItem value="item-4" className="border-b pb-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline">
                    4. Mengatur Informasi Web & Teks Footer
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 text-muted-foreground leading-relaxed text-base">
                    Apabila Anda ingin mengubah teks sambutan utama di beranda, informasi kontak (email/telepon/alamat) yang berada di <b>bagian paling bawah website (Footer)</b>, serta tautan sosial media, silakan buka menu <b>Informasi Web</b> di panel samping. Perubahan ini akan langsung memperbarui area *footer* di seluruh halaman situs.
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="item-5" className="border-b pb-4">
                <AccordionTrigger className="text-lg font-bold hover:no-underline">
                  {isSuperAdmin ? "5. " : "2. "}Mengubah Password & Cara Logout
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6 text-muted-foreground leading-relaxed text-base">
                  Untuk <b>mengubah password</b> atau <b>keluar dari sistem (Logout)</b>, perhatikan bagian <b>pojok kanan atas layar Anda</b>. Klik pada ikon profil atau nama <b>Admin</b> untuk memunculkan menu tersembunyi. 
                  <br /><br />
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Pilih <b>Pengaturan Akun (Settings)</b> untuk mengubah <i>username</i> dan <i>password</i>.</li>
                    <li>Pilih <b>Keluar (Log out)</b> untuk mengakhiri sesi Anda dengan aman saat hendak meninggalkan perangkat atau komputer.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {isSuperAdmin && (
                <AccordionItem value="item-6" className="border-b pb-4">
                  <AccordionTrigger className="text-lg font-bold hover:no-underline text-red-700">
                    6. Manajemen Penyimpanan
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-6 text-muted-foreground leading-relaxed text-base">
                    <p className="mb-4">
                      Alat pembersih ini berguna untuk menghapus sisa-sisa gambar sampah (yatim piatu) di Database akibat peramban tertutup sebelum artikel sempat disimpan. Hanya gambar yang usianya lebih dari 24 jam yang akan dipindai dan dibersihkan dari Database.
                    </p>
                    <StorageManagement />
                  </AccordionContent>
                </AccordionItem>
              )}

            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
