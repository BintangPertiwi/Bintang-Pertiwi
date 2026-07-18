export type SlideData = {
  id: string;
  judul: string;
  linkText: string;
  linkHref: string;
  foto: File | null;
  currentFotoUrl: string;
};

export type ParsedSlide = {
  id?: string;
  title?: string;
  linkText?: string;
  linkHref?: string;
  image?: string;
};

import * as z from "zod";

export const beritaSchema = z.object({
  judul: z.string().min(3, { message: "Judul berita minimal 3 karakter." }),
  kategori: z.string().min(1, { message: "Kategori wajib dipilih atau diisi." }),
  ringkasan: z.string().max(200, { message: "Ringkasan maksimal 200 karakter." }).optional(),
  isi_berita: z.string().min(10, { message: "Isi berita minimal 10 karakter." }),
  status_publikasi: z.enum(["Publik", "Draf", "Arsip"]),
  foto: z.any().optional(),
});

export type BeritaFormValues = z.infer<typeof beritaSchema>;

export const galeriSchema = z.object({
  judul: z.string().min(3, { message: "Judul galeri minimal 3 karakter." }).max(100, { message: "Judul maksimal 100 karakter." }),
  kategori: z.string().min(1, { message: "Kategori wajib diisi." }),
  deskripsi: z.string().max(200, { message: "Deskripsi maksimal 200 karakter." }).optional(),
  foto: z.any().optional(),
});

export type GaleriFormValues = z.infer<typeof galeriSchema>;

export const dokumenSchema = z.object({
  judul: z.string().min(3, { message: "Judul dokumen minimal 3 karakter." }).max(120, { message: "Judul maksimal 120 karakter." }),
  kategori: z.string().min(1, { message: "Kategori wajib dipilih atau diisi." }),
  deskripsi: z.string().max(300, { message: "Deskripsi maksimal 300 karakter." }).optional(),
  file: z.any().optional(),
});

export type DokumenFormValues = z.infer<typeof dokumenSchema>;

export const produkSchema = z
  .object({
    nama: z.string().min(3, { message: "Nama produk minimal 3 karakter." }).max(120, { message: "Nama maksimal 120 karakter." }),
    kategori: z.string().min(1, { message: "Kategori wajib dipilih atau diisi." }),
    harga: z.string().regex(/^\d+$/, { message: "Harga harus berupa angka (tanpa titik/koma)." }),
    harga_coret: z.string().regex(/^\d*$/, { message: "Harga coret harus berupa angka." }).optional(),
    satuan: z.string().max(30, { message: "Satuan maksimal 30 karakter." }).optional(),
    stok: z.enum(["Tersedia", "Habis"]),
    deskripsi_singkat: z.string().min(1, { message: "Deskripsi singkat wajib diisi." }).max(200, { message: "Deskripsi singkat maksimal 200 karakter." }),
    deskripsi_lengkap: z.string().max(5000, { message: "Deskripsi lengkap maksimal 5000 karakter." }).optional(),
    informasi_tambahan: z.string().max(2000, { message: "Informasi tambahan maksimal 2000 karakter." }).optional(),
    sku: z.string().max(60, { message: "SKU maksimal 60 karakter." }).optional(),
    varian: z.string().max(300, { message: "Varian maksimal 300 karakter." }).optional(),
    tags: z.string().max(200, { message: "Tags maksimal 200 karakter." }).optional(),
    nomor_wa: z.string().max(20, { message: "Nomor WhatsApp maksimal 20 karakter." }).optional(),
  })
  .refine(
    (data) => {
      if (!data.harga_coret) return true;
      const coret = Number.parseInt(data.harga_coret, 10);
      const harga = Number.parseInt(data.harga, 10);
      return coret === 0 || coret > harga;
    },
    { message: "Harga coret harus lebih besar dari harga jual.", path: ["harga_coret"] }
  );

export type ProdukFormValues = z.infer<typeof produkSchema>;
