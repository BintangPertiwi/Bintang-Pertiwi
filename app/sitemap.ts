import { MetadataRoute } from 'next';
import { getBeritaList } from '@/lib/google-sheets';

const baseUrl = 'https://bintangpertiwi.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let beritaUrls: MetadataRoute.Sitemap = [];
  
  try {
    // Get all news for dynamic routes
    const beritaList = await getBeritaList();
    
    // Filter for public news
    const publicBerita = beritaList.filter(
      (b) => b.status_publikasi === 'Publik' || !b.status_publikasi
    );

    beritaUrls = publicBerita.map((berita) => ({
      url: `${baseUrl}/berita/${berita.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Gagal mengambil data berita untuk sitemap:", error);
    // Continue with static urls if dynamic fetching fails
  }

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/profil`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/berita`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pengaduan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  return [...staticUrls, ...beritaUrls];
}
