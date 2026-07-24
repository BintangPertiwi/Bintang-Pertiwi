const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function uploadToTelegram(fileBuffer: Buffer, fileName: string, caption?: string): Promise<string> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Missing Telegram Bot Token or Chat ID in environment variables");
  }

  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const mimeType = mimeMap[ext || ""] || "image/jpeg";

  const formData = new FormData();
  formData.append("chat_id", TELEGRAM_CHAT_ID);
  formData.append("photo", new Blob([new Uint8Array(fileBuffer)], { type: mimeType }), fileName);

  if (caption) {
    formData.append("caption", caption);
  }

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Telegram sendPhoto error:", text);
    throw new Error("Failed to upload photo to Telegram");
  }

  const data = await res.json();
  if (!data.ok || !data.result || !data.result.photo) {
    throw new Error("Invalid response from Telegram");
  }

  const photos = data.result.photo;
  const largestPhoto = photos[photos.length - 1];
  return largestPhoto.file_id;
}

export async function getFileFromTelegram(fileId: string): Promise<Buffer> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("Missing Telegram Bot Token");
  }

  const getFileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
  if (!getFileRes.ok) {
    throw new Error("Failed to get file info from Telegram");
  }

  const data = await getFileRes.json();
  if (!data.ok || !data.result || !data.result.file_path) {
    throw new Error("Invalid getFile response from Telegram");
  }

  const filePath = data.result.file_path;

  const downloadRes = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`);
  if (!downloadRes.ok) {
    throw new Error("Failed to download file from Telegram");
  }

  const arrayBuffer = await downloadRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
