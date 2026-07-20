import type { MetadataRoute } from 'next'
import { getBeritaList, getProdukList } from '@/lib/db/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bintangpertiwi.com'

  const routes: MetadataRoute.Sitemap = ['', '/berita', '/dokumen', '/galeri', '/kontak', '/produk-umkm'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    const beritaList = await getBeritaList()
    const publicBerita = beritaList.filter((b) => b.status_publikasi === 'Publik' || !b.status_publikasi)
    const beritaRoutes = publicBerita.map((b) => ({
      url: `${baseUrl}/berita/${b.id}`,
      lastModified: new Date(b.tanggal),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
    routes.push(...beritaRoutes)
  } catch (error) {
    console.error('Failed to fetch berita for sitemap', error)
  }

  try {
    const produkList = await getProdukList()
    const produkRoutes = produkList.map((p) => ({
      url: `${baseUrl}/produk-umkm/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
    routes.push(...produkRoutes)
  } catch (error) {
    console.error('Failed to fetch produk for sitemap', error)
  }

  return routes
}
