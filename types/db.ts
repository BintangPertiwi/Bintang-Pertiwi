export interface BeritaRow {
  id: string;
  judul: string;
  tanggal: string;
  ringkasan: string;
  isi_berita: string;
  url_foto: string;
  kategori: string;
  media_assets?: string;
  status_publikasi?: string;
}

export interface GaleriRow {
  id: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  tanggal_upload: string;
  url_foto: string;
}

export type StokStatus = "Tersedia" | "Habis";

export interface ProdukRow {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  harga: number;
  harga_coret?: number;
  satuan: string;
  stok: StokStatus;
  deskripsi_singkat: string;
  deskripsi_lengkap: string;
  informasi_tambahan: string;
  gambar_urls: string[];
  sku: string;
  varian: string[];
  tags: string[];
  created_at?: string;
}

export interface PengaduanRow {
  id: string;
  tanggal: string;
  nama_lengkap: string;
  nik: string;
  status_warga: string;
  no_hp: string | null;
  kategori: string | null;
  isi_laporan: string;
  url_foto: string | null;
  status: string | null;
  created_at: string | null;
}

export interface PerangkatRow {
  id: string;
  urutan: number;
  nama: string;
  jabatan: string;
  url_foto: string;
}
