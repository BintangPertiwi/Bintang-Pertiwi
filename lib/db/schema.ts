import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const adminAuth = sqliteTable("admin_auth", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("super_admin"),
  nama: text("nama").default(""),
  wa_number: text("wa_number").default(""),
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
  created_by: integer("created_by"),
  nomor_wa: text("nomor_wa").default(""),
  created_at: text("created_at").default(sql`(datetime('now'))`),
  updated_at: text("updated_at").default(sql`(datetime('now'))`),
});

export const globalConfig = sqliteTable("global_config", {
  key: text("key").primaryKey(),
  value: text("value").default(""),
});

export const dokumen = sqliteTable("dokumen", {
  id: text("id").primaryKey(),
  judul: text("judul").notNull().default(""),
  deskripsi: text("deskripsi").default(""),
  kategori: text("kategori").default(""),
  url_file: text("url_file").notNull(),
  tipe_file: text("tipe_file").default(""),
  resource_type: text("resource_type").default("raw"),
  tanggal: text("tanggal").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

export const perangkatDusun = sqliteTable("perangkat_dusun", {
  id: text("id").primaryKey(),
  urutan: integer("urutan").notNull(),
  nama: text("nama").notNull(),
  jabatan: text("jabatan").notNull(),
  url_foto: text("url_foto").default(""),
});
