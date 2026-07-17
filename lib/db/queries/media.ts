import { db } from "../index";
import { beritaDusun, galeriDusun, globalConfig, produkUmkm } from "../schema";
import { eq, like, or } from "drizzle-orm";

/**
 * Cek apakah sebuah URL Cloudinary masih dirujuk oleh konten tersimpan
 * (produk, berita, galeri, atau konfigurasi/hero). Dipakai untuk mencegah
 * penghapusan gambar milik konten lain lewat endpoint delete generik —
 * hanya gambar "yatim" (baru di-upload, belum tersimpan) yang boleh dihapus.
 */
export async function isMediaUrlReferenced(url: string): Promise<boolean> {
  const term = `%${url}%`;

  const produk = await db
    .select({ id: produkUmkm.id })
    .from(produkUmkm)
    .where(like(produkUmkm.gambar_urls, term))
    .limit(1);
  if (produk.length > 0) return true;

  const berita = await db
    .select({ id: beritaDusun.id })
    .from(beritaDusun)
    .where(or(eq(beritaDusun.url_foto, url), like(beritaDusun.media_assets, term)))
    .limit(1);
  if (berita.length > 0) return true;

  const galeri = await db
    .select({ id: galeriDusun.id })
    .from(galeriDusun)
    .where(eq(galeriDusun.url_foto, url))
    .limit(1);
  if (galeri.length > 0) return true;

  const config = await db
    .select({ key: globalConfig.key })
    .from(globalConfig)
    .where(like(globalConfig.value, term))
    .limit(1);
  if (config.length > 0) return true;

  return false;
}
