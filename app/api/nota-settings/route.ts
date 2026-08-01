import { getSession } from "@/lib/auth";
import { getNotaSettings, upsertNotaSettings } from "@/lib/db/queries/nota-settings";
import { uploadToTelegram } from "@/lib/telegram-storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getNotaSettings(session.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching nota settings:", error);
    return NextResponse.json({ error: "Gagal mengambil pengaturan nota" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    let urlLogo = formData.get("url_logo") as string;
    const file = formData.get("file") as File | null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExtension = file.name.split(".").pop() || "png";
      const fileName = `logo_${session.id}_${Date.now()}.${fileExtension}`;
      
      const fileId = await uploadToTelegram(
        buffer, 
        fileName, 
        `🖼️ Logo Nota\n👤 User ID: ${session.id}`
      );
      urlLogo = `/api/jurnal/nota/${fileId}`;
    }

    const data: {
      nama_usaha: string;
      alamat: string;
      nomor_telepon: string;
      url_logo?: string;
    } = {
      nama_usaha: (formData.get("nama_usaha") as string) || "",
      alamat: (formData.get("alamat") as string) || "",
      nomor_telepon: (formData.get("nomor_telepon") as string) || "",
    };

    if (urlLogo) {
      data.url_logo = urlLogo;
    }

    await upsertNotaSettings(session.id, data);

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Error saving nota settings:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
