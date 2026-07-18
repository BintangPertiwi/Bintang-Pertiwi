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

export interface DokumenRow {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  url_file: string;
  tipe_file: string;
  resource_type: string;
  tanggal: string;
  created_at?: string;
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
  created_by?: number;
  nomor_wa?: string;
  owner_wa?: string;
  created_at?: string;
}

export interface PerangkatRow {
  id: string;
  urutan: number;
  nama: string;
  jabatan: string;
  url_foto: string;
}
