import { db } from "../index";
import { notaSettings, adminAuth } from "../schema";
import { eq } from "drizzle-orm";
import type { NotaSettingsRow } from "@/types";

const DEFAULT_ALAMAT = "Dusun Danau Raya & Pinang Mas, Desa Persiapan Pinang Raya, Kecamatan Sangatta Selatan, Kabupaten Kutai Timur, Provinsi Kalimantan Timur";

export async function getNotaSettings(userId: number): Promise<NotaSettingsRow> {
  const result = await db
    .select()
    .from(notaSettings)
    .where(eq(notaSettings.user_id, userId))
    .limit(1);

  if (result.length > 0) {
    return {
      ...result[0],
      nama_usaha: result[0].nama_usaha || "",
      alamat: result[0].alamat || "",
      nomor_telepon: result[0].nomor_telepon || "",
      url_logo: result[0].url_logo || "",
    };
  }

  // Fetch admin auth to get default name and wa_number
  const adminResult = await db
    .select({ nama: adminAuth.nama, username: adminAuth.username, wa_number: adminAuth.wa_number })
    .from(adminAuth)
    .where(eq(adminAuth.id, userId))
    .limit(1);
    
  const admin = adminResult[0];
  const namaUsaha = admin?.nama?.trim() || admin?.username || "";
  const nomorTelepon = admin?.wa_number || "";

  return {
    id: "",
    user_id: userId,
    nama_usaha: namaUsaha,
    alamat: DEFAULT_ALAMAT,
    nomor_telepon: nomorTelepon,
    url_logo: "/icon.png",
  };
}

export async function upsertNotaSettings(
  userId: number,
  data: Partial<NotaSettingsRow>
): Promise<void> {
  const existing = await db
    .select({ id: notaSettings.id })
    .from(notaSettings)
    .where(eq(notaSettings.user_id, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(notaSettings)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where(eq(notaSettings.user_id, userId));
  } else {
    // Determine defaults for missing fields
    const adminResult = await db
      .select({ nama: adminAuth.nama, username: adminAuth.username, wa_number: adminAuth.wa_number })
      .from(adminAuth)
      .where(eq(adminAuth.id, userId))
      .limit(1);
      
    const admin = adminResult[0];
    const namaUsaha = admin?.nama?.trim() || admin?.username || "";
    const nomorTelepon = admin?.wa_number || "";

    await db.insert(notaSettings).values({
      id: crypto.randomUUID(),
      user_id: userId,
      nama_usaha: data.nama_usaha !== undefined ? data.nama_usaha : namaUsaha,
      alamat: data.alamat !== undefined ? data.alamat : DEFAULT_ALAMAT,
      nomor_telepon: data.nomor_telepon !== undefined ? data.nomor_telepon : nomorTelepon,
      url_logo: data.url_logo !== undefined ? data.url_logo : "/icon.png",
    });
  }
}
