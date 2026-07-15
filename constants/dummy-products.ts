export interface Product {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  harga: number;
  harga_coret?: number;
  rating: number;
  ulasan: number;
  stok: "Tersedia" | "Habis";
  deskripsi_singkat: string;
  deskripsi_lengkap: string;
  informasi_tambahan: string;
  gambar_urls: string[];
  sku: string;
  tags: string[];
}

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "sayur-kangkung-organik",
    nama: "Sayur Kangkung Organik",
    kategori: "Sayuran",
    harga: 15000,
    harga_coret: 20000,
    rating: 4.8,
    ulasan: 24,
    stok: "Tersedia",
    deskripsi_singkat: "Kangkung organik segar hasil panen dari kebun binaan Pertamina EP.",
    deskripsi_lengkap: "Sayur Kangkung organik yang ditanam tanpa menggunakan pestisida kimia. Dirawat dengan pupuk kompos alami, sehingga lebih sehat dan memiliki tekstur renyah saat dimasak. Dipanen setiap pagi untuk menjaga kesegarannya saat dikirim kepada pembeli.",
    informasi_tambahan: "Berat Bersih: 500 gram per ikat.\nDaya Tahan: 3 hari di dalam kulkas.\nSertifikasi: Organik Lokal.",
    gambar_urls: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=800",
    ],
    sku: "SAY-KNG-001",
    tags: ["Sayuran", "Organik", "Hijau"],
  },
  {
    id: "prod-2",
    slug: "tomat-ceri-segar",
    nama: "Tomat Ceri Segar",
    kategori: "Sayuran",
    harga: 25000,
    harga_coret: 30000,
    rating: 4.9,
    ulasan: 45,
    stok: "Tersedia",
    deskripsi_singkat: "Tomat ceri manis yang cocok untuk salad dan camilan sehat.",
    deskripsi_lengkap: "Tomat ceri merah segar muda yang ditanam di polybag halaman rumah warga dusun. Sangat manis, kaya akan vitamin C dan antioksidan.",
    informasi_tambahan: "Berat Bersih: 250 gram.\nPengemasan: Menggunakan kotak mika yang aman.\nCara Penyimpanan: Simpan di suhu ruangan yang sejuk.",
    gambar_urls: [
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&q=80&w=800",
    ],
    sku: "SAY-TOM-002",
    tags: ["Sayuran", "Buah", "Salad"],
  },
  {
    id: "prod-3",
    slug: "keripik-bayam-krispi",
    nama: "Keripik Bayam Krispi",
    kategori: "Olahan",
    harga: 12000,
    rating: 4.7,
    ulasan: 89,
    stok: "Tersedia",
    deskripsi_singkat: "Camilan keripik bayam renyah dengan bumbu rahasia dusun.",
    deskripsi_lengkap: "Olahan daun bayam pilihan yang digoreng dengan tepung bumbu yang sangat renyah. Sangat cocok dijadikan lauk maupun camilan saat bersantai. Tidak menyerap banyak minyak.",
    informasi_tambahan: "Berat Bersih: 150 gram.\nKomposisi: Daun bayam, tepung beras, bawang putih, ketumbar, garam, minyak nabati.\nKadaluarsa: 3 bulan setelah tanggal produksi.",
    gambar_urls: [
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=800",
    ],
    sku: "OLH-BYM-001",
    tags: ["Camilan", "Keripik", "Gurih"],
  },
  {
    id: "prod-4",
    slug: "madu-hutan-asli",
    nama: "Madu Hutan Asli",
    kategori: "Olahan",
    harga: 75000,
    harga_coret: 90000,
    rating: 5.0,
    ulasan: 112,
    stok: "Habis",
    deskripsi_singkat: "Madu murni hasil panen dari kelompok peternak lebah hutan.",
    deskripsi_lengkap: "Madu asli tanpa campuran gula atau air. Dipanen secara tradisional untuk menjaga khasiat dan enzim alaminya. Berguna untuk meningkatkan daya tahan tubuh.",
    informasi_tambahan: "Volume: 250 ml.\nKemasan: Botol Kaca tebal.\nSaran Konsumsi: 1-2 sendok makan setiap pagi.",
    gambar_urls: [
      "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=800",
    ],
    sku: "OLH-MAD-001",
    tags: ["Madu", "Kesehatan", "Murni"],
  },
  {
    id: "prod-5",
    slug: "keranjang-bambu-anyam",
    nama: "Keranjang Bambu Anyam",
    kategori: "Kerajinan",
    harga: 45000,
    rating: 4.6,
    ulasan: 18,
    stok: "Tersedia",
    deskripsi_singkat: "Kerajinan tangan anyaman bambu untuk wadah buah atau sayur.",
    deskripsi_lengkap: "Keranjang buatan tangan ibu-ibu dusun yang terbuat dari bambu apus pilihan. Sangat kuat, ramah lingkungan, dan cocok sebagai hiasan rumah atau keranjang belanja.",
    informasi_tambahan: "Dimensi: 30x20x15 cm.\nMaterial: Bambu lokal yang telah dijemur.\nKekuatan: Mampu menahan beban hingga 5 kg.",
    gambar_urls: [
      "https://images.unsplash.com/photo-1622153060419-468f83a0f8f8?auto=format&fit=crop&q=80&w=800",
    ],
    sku: "KRJ-BMB-001",
    tags: ["Kerajinan", "Handmade", "Ramah Lingkungan"],
  },
  {
    id: "prod-6",
    slug: "sambal-terasi-pedas",
    nama: "Sambal Terasi Pedas",
    kategori: "Olahan",
    harga: 20000,
    rating: 4.8,
    ulasan: 56,
    stok: "Tersedia",
    deskripsi_singkat: "Sambal terasi rumahan dengan pedas nikmat.",
    deskripsi_lengkap: "Dibuat dari cabai segar hasil panen petani lokal dan terasi pilihan. Cocok untuk menemani santap siang keluarga.",
    informasi_tambahan: "Berat Bersih: 120 gram.\nKomposisi: Cabai rawit, cabai merah, tomat, terasi, bawang merah, bawang putih, garam, gula aren.\nKadaluarsa: 1 bulan setelah segel dibuka, simpan di pendingin.",
    gambar_urls: [
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800",
    ],
    sku: "OLH-SMB-001",
    tags: ["Sambal", "Pedas", "Bumbu"],
  }
];

export const PRODUCT_CATEGORIES = [
  "Semua",
  "Sayuran",
  "Olahan",
  "Kerajinan"
];
