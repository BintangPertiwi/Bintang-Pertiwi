import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const adminAuth = sqliteTable("admin_auth", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const beritaDusun = sqliteTable("berita_dusun", {
  id: text("id").primaryKey(),
  judul: text("judul").notNull(),
  tanggal: text("tanggal").notNull(),
  ringkasan: text("ringkasan").default(""),
  isi_berita: text("isi_berita").notNull(),
  url_foto: text("url_foto").default(""),
  kategori: text("kategori").default(""),
  media_assets: text("media_assets").default(""),
  status_publikasi: text("status_publikasi").default("Publik"),
  created_at: text("created_at").default(sql`(datetime('now'))`),
  updated_at: text("updated_at").default(sql`(datetime('now'))`),
});

export const galeriDusun = sqliteTable("galeri_dusun", {
  id: text("id").primaryKey(),
  judul: text("judul").default(""),
  kategori: text("kategori").notNull(),
  deskripsi: text("deskripsi").default(""),
  tanggal_upload: text("tanggal_upload").notNull(),
  url_foto: text("url_foto").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

export const produkUmkm = sqliteTable("produk_umkm", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nama: text("nama").notNull(),
  kategori: text("kategori").default(""),
  harga: integer("harga").notNull().default(0),
  harga_coret: integer("harga_coret"),
  stok: text("stok").default("Tersedia"),
  satuan: text("satuan").default(""),
  deskripsi_singkat: text("deskripsi_singkat").default(""),
  deskripsi_lengkap: text("deskripsi_lengkap").default(""),
  informasi_tambahan: text("informasi_tambahan").default(""),
  gambar_urls: text("gambar_urls").default("[]"),
  sku: text("sku").default(""),
  varian: text("varian").default("[]"),
  tags: text("tags").default("[]"),
  created_at: text("created_at").default(sql`(datetime('now'))`),
  updated_at: text("updated_at").default(sql`(datetime('now'))`),
});

export const globalConfig = sqliteTable("global_config", {
  key: text("key").primaryKey(),
  value: text("value").default(""),
});

export const mapsData = sqliteTable("maps_data", {
  id: text("id").primaryKey(),
  nama_fasum: text("nama_fasum").notNull(),
  kategori_ikon: text("kategori_ikon").default(""),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  deskripsi: text("deskripsi").default(""),
  url_foto: text("url_foto").default(""),
});

export const pengaduanWarga = sqliteTable("pengaduan_warga", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  nama_lengkap: text("nama_lengkap").notNull(),
  nik: text("nik").notNull(),
  status_warga: text("status_warga").notNull(),
  no_hp: text("no_hp").default(""),
  kategori: text("kategori").default(""),
  isi_laporan: text("isi_laporan").notNull(),
  url_foto: text("url_foto").default(""),
  status: text("status").default("Menunggu"),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

export const perangkatDusun = sqliteTable("perangkat_dusun", {
  id: text("id").primaryKey(),
  urutan: integer("urutan").notNull(),
  nama: text("nama").notNull(),
  jabatan: text("jabatan").notNull(),
  url_foto: text("url_foto").default(""),
});
