import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateUserWa } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";

// Update nomor WhatsApp akun sendiri (tanpa reset sesi). Semua role boleh.
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const { wa_number } = await request.json();
    if (typeof wa_number !== "string") {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    await updateUserWa(session.id, wa_number.trim());
    // Produk detail publik memuat nomor WA pemilik (via cache tag "produk").
    revalidateTag("produk", "max");

    return NextResponse.json({ success: true, message: "Nomor WhatsApp berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update WA number:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menyimpan nomor WhatsApp." },
      { status: 500 }
    );
  }
}
