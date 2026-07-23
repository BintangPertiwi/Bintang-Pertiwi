import { requireRole } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { getGlobalConfig, updateGlobalConfig } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!(await requireRole(["super_admin"]))) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }
    const data = await request.json();
    
    if (typeof data !== "object" || data === null) {
      return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
    }
    
    const allowedKeys = [
      "beranda_hero_slides",
      "beranda_tentang_narasi",
      "beranda_tentang_penduduk",
      "beranda_tentang_rw",
      "beranda_tentang_rt",
      "beranda_tentang_penerima_tidak_langsung",
      "beranda_galeri_ids",
      "beranda_revenue_narasi",
    ];
    
    const updates: Record<string, string> = {};
    for (const key of allowedKeys) {
      if (typeof data[key] === "string") {
        updates[key] = data[key];
      }
    }
    
    if (Object.keys(updates).length > 0) {
      const urlsToDelete: string[] = [];
      if (updates["beranda_hero_slides"]) {
        const oldConfig = await getGlobalConfig();
        const oldSlidesJson = oldConfig["beranda_hero_slides"];
        
        if (oldSlidesJson) {
          try {
            const oldSlides = JSON.parse(oldSlidesJson);
            const newSlides = JSON.parse(updates["beranda_hero_slides"]);
            
            const oldUrls = new Set<string>();
            const newUrls = new Set<string>();
            
            if (Array.isArray(oldSlides)) {
              oldSlides.forEach((slide: { image?: string }) => {
                if (slide.image && slide.image.includes("cloudinary.com")) {
                  oldUrls.add(slide.image);
                }
              });
            }
            
            if (Array.isArray(newSlides)) {
              newSlides.forEach((slide: { image?: string }) => {
                if (slide.image && slide.image.includes("cloudinary.com")) {
                  newUrls.add(slide.image);
                }
              });
            }
            
            oldUrls.forEach((url) => {
              if (!newUrls.has(url)) {
                urlsToDelete.push(url);
              }
            });
          } catch (e) {
            console.error("Failed to parse hero slides for cleanup:", e);
          }
        }
      }

      await updateGlobalConfig(updates);
      
      if (urlsToDelete.length > 0) {
        await Promise.allSettled(urlsToDelete.map(url => deleteFromCloudinary(url)));
      }
      
      revalidateTag("global-config", "max");
      revalidateTag("galeri", "max"); 
    }
    
    return NextResponse.json({ success: true, message: "Pengaturan beranda berhasil diperbarui" });
  } catch (error) {
    console.error("Failed to update pengaturan beranda:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui pengaturan" },
      { status: 500 }
    );
  }
}
