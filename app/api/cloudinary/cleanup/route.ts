import { requireRole } from "@/lib/auth";
import { deleteFromCloudinary, getCloudinaryResources } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { beritaDusun, galeriDusun, globalConfig, produkUmkm } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid." }, { status: 401 });
    }

    const startTime = Date.now();
    

    // Menggunakan kueri langsung (bukan DAL) agar jika Turso timeout/error, fungsi ini langsung melempar error
    // dan masuk ke block catch, mencegah penghapusan media yatim piatu secara tak sengaja.
    const [beritaList, galeriList, produkList, configRows, cloudinaryResources] = await Promise.all([
      db.select().from(beritaDusun),
      db.select().from(galeriDusun),
      db.select().from(produkUmkm),
      db.select().from(globalConfig),
      getCloudinaryResources(),
    ]);
    
    // Build config map
    const gConfig: Record<string, string> = {};
    for (const row of configRows) {
      gConfig[row.key] = row.value || "";
    }

    // 2. Build Set of Used URLs (O(1) lookup)
    const usedUrls = new Set<string>();
    
    beritaList.forEach(b => {
      if (b.url_foto) usedUrls.add(b.url_foto);
      if (b.media_assets) {
        try {
          const assets = JSON.parse(b.media_assets);
          if (Array.isArray(assets)) {
            assets.forEach(url => usedUrls.add(url));
          }
        } catch {
          // ignore
        }
      }
      // Also extract from isi_berita just in case
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      while ((match = imgRegex.exec(b.isi_berita)) !== null) {
        usedUrls.add(match[1]);
      }
    });

    galeriList.forEach(g => {
      if (g.url_foto) usedUrls.add(g.url_foto);
    });

    produkList.forEach(p => {
      if (p.gambar_urls) {
        try {
          const urls = JSON.parse(p.gambar_urls);
          if (Array.isArray(urls)) {
            urls.forEach(url => {
              if (typeof url === "string") usedUrls.add(url);
            });
          }
        } catch {
          // ignore
        }
      }
    });

    // Parse Hero Slides (Global Config)
    if (gConfig["beranda_hero_slides"]) {
      try {
        const slides = JSON.parse(gConfig["beranda_hero_slides"]);
        if (Array.isArray(slides)) {
          slides.forEach((slide: { image?: string; currentFotoUrl?: string }) => {
            if (slide.image) usedUrls.add(slide.image);
            if (slide.currentFotoUrl) usedUrls.add(slide.currentFotoUrl);
          });
        }
      } catch (e) {
        console.error("Error parsing beranda_hero_slides:", e);
      }
    }

    // 3. Find Orphaned Media older than 24 hours
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const orphanedUrls: string[] = [];

    for (const res of cloudinaryResources) {
      const isUsed = usedUrls.has(res.secure_url) || usedUrls.has(res.secure_url.replace("https://", "http://"));
      if (!isUsed) {
        const createdAtTime = new Date(res.created_at).getTime();
        if (now - createdAtTime > oneDayInMs) {
          orphanedUrls.push(res.secure_url);
        }
      }
    }

    // 4. Delete Orphaned Media concurrently
    if (orphanedUrls.length > 0) {
      await Promise.allSettled(orphanedUrls.map(url => deleteFromCloudinary(url)));
    }

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Berhasil memindai. Ditemukan dan dihapus ${orphanedUrls.length} media sampah.`,
      deletedCount: orphanedUrls.length,
      executionTimeMs,
    });
  } catch (error) {
    console.error("Cleanup API Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan sistem saat pembersihan." }, { status: 500 });
  }
}
