import { verifyAdminSession } from "@/lib/auth";
import { insertPengaduan, updatePengaduanStatus } from "@/lib/db/queries/pengaduan";
import { sendTelegramMessage, sendTelegramPhoto } from "@/lib/telegram";
import { generateId } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// Global In-Memory Rate Limiter Map
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>();


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const nama_lengkap = formData.get("nama_lengkap") as string;
    const nik = formData.get("nik") as string;
    const status_warga = formData.get("status_warga") as string;
    const no_hp = formData.get("no_hp") as string;
    const kategori = formData.get("kategori") as string;
    const isi_laporan = formData.get("isi_laporan") as string;
    const file = formData.get("file") as File | null;

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (ip !== "unknown") {
      const now = Date.now();
      const windowMs = 10 * 1000; 
      const maxRequests = 5;

      const record = rateLimitMap.get(ip);
      if (!record) {
        rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
      } else {
        if (now - record.firstRequestTime > windowMs) {
          rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
        } else {
          record.count += 1;
          if (record.count > maxRequests) {
            return NextResponse.json(
              { success: false, message: "Terlalu banyak permintaan. Mohon tunggu 10 detik sebelum mencoba lagi." },
              { status: 429 }
            );
          }
        }
      }
    }

    const honeypot = formData.get("website_url") as string;
    if (honeypot) {
      return NextResponse.json({
        success: true,
        message: "Laporan berhasil dikirim.",
        data: { id: `PGD-${Date.now()}` },
      });
    }

    const formLoadTimeEncoded = formData.get("form_load_time") as string;
    if (formLoadTimeEncoded) {
      try {
        const loadTimeStr = Buffer.from(formLoadTimeEncoded, "base64").toString("ascii");
        const loadTime = parseInt(loadTimeStr, 10);
        if (!isNaN(loadTime)) {
          const elapsed = Date.now() - loadTime;
          if (elapsed < 3000) {
            return NextResponse.json(
              { success: false, message: "Pengisian form terlalu cepat. Sistem mengidentifikasi indikasi bot spam." },
              { status: 400 }
            );
          }
        }
      } catch (e) {
        console.error("Gagal membaca token waktu:", e);
      }
    }

    if (!nama_lengkap || !status_warga || !no_hp || !kategori || !isi_laporan) {
      return NextResponse.json(
        { success: false, message: "Data pengaduan tidak lengkap." },
        { status: 400 }
      );
    }

    const id = `PGD-${Date.now()}-${generateId(5)}`;
    const tanggal = new Date().toISOString();
    const status = "Menunggu";


    const isWargaLokal = status_warga === "Warga Lokal" || status_warga === "Warga"; // Note: we changed label to "Pengunjung" but value is "Bukan Warga Lokal"
    const wargaIcon = isWargaLokal ? "🏡" : "🧳";
    
    const MAX_LAPORAN_LENGTH = 500;
    const truncated_isi_laporan = isi_laporan.length > MAX_LAPORAN_LENGTH 
      ? isi_laporan.substring(0, MAX_LAPORAN_LENGTH) + "...\n\n(Laporan terlalu panjang, cek selengkapnya di dashboard)"
      : isi_laporan;

    const caption = `🚨 <b>LAPORAN BARU DARI WARGA</b>\n\n👤 <b>Nama:</b> ${nama_lengkap}\n📝 <b>NIK:</b> ${nik || "-"}\n${wargaIcon} <b>Status:</b> ${status_warga}\n📞 <b>No HP/WA:</b> <a href="https://wa.me/${no_hp.replace(/^0/, '62').replace(/\D/g, '')}">${no_hp}</a>\n🏷 <b>Kategori:</b> ${kategori}\n\n💬 <b>Isi Laporan:</b>\n<i>"${truncated_isi_laporan}"</i>\n\n📅 <b>Tanggal:</b> ${new Date().toLocaleString("id-ID")}\n🆔 <b>ID:</b> ${id}`;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await sendTelegramPhoto(buffer, file.name, file.type, caption);
    } else {
      await sendTelegramMessage(caption);
    }


    try {
      await insertPengaduan({
        id,
        nama_lengkap,
        nik: nik || "",
        status_warga,
        no_hp,
        kategori,
        isi_laporan,
        url_foto: "",
        status,
        tanggal,
      });
    } catch (e) {
      console.error("DB Insert Error:", e);
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan pengaduan ke database." },
        { status: 500 }
      );
    }

    revalidateTag("pengaduan", "max");

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil dikirim.",
      data: { id },
    });
  } catch (error) {
    console.error("POST Pengaduan Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memproses laporan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();
    const { status } = data;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "ID dan status wajib disertakan." },
        { status: 400 }
      );
    }

    const updated = await updatePengaduanStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui status pengaduan." },
        { status: 500 }
      );
    }

    revalidateTag("pengaduan", "max");

    return NextResponse.json({
      success: true,
      message: "Status berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PATCH Pengaduan Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memproses pembaruan." },
      { status: 500 }
    );
  }
}
