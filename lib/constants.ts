export const TABLE_NAMES = {
  admin_auth: "Akun & Pengguna",
  nota_settings: "Pengaturan Nota",
  berita_dusun: "Berita",
  galeri_dusun: "Galeri",
  dokumen: "Dokumen",
  produk_umkm: "Produk",
  jurnal_penjualan: "Jurnal Penjualan",
  jurnal_items: "Item Penjualan",

  global_config: "Pengaturan Web",
};

export const BACKUP_GROUPS = [
  { id: "akun", label: "Akun & Pengguna", tables: ["admin_auth", "nota_settings"] },
  { id: "berita", label: "Berita", tables: ["berita_dusun"] },
  { id: "galeri", label: "Galeri", tables: ["galeri_dusun"] },
  { id: "dokumen", label: "Dokumen", tables: ["dokumen"] },
  { id: "produk", label: "Produk UMKM", tables: ["produk_umkm"] },
  { id: "jurnal", label: "Jurnal Penjualan", tables: ["jurnal_penjualan", "jurnal_items"] },

  { id: "config", label: "Pengaturan Web", tables: ["global_config"] },
];
