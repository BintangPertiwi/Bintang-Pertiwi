const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function uploadToTelegram(fileBuffer: Buffer, fileName: string, caption?: string): Promise<string> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Missing Telegram Bot Token or Chat ID in environment variables");
  }

  const boundary = "boundary_multipart_upload_telegram";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--\r\n`;

  const chatIdPart = `Content-Disposition: form-data; name="chat_id"\r\n\r\n${TELEGRAM_CHAT_ID}`;
  const filePartHeader = `Content-Disposition: form-data; name="photo"; filename="${fileName}"\r\nContent-Type: image/jpeg\r\n\r\n`;

  const parts = [
    Buffer.from(delimiter),
    Buffer.from(chatIdPart),
  ];

  if (caption) {
    const captionPart = `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}`;
    parts.push(Buffer.from(delimiter), Buffer.from(captionPart));
  }

  parts.push(
    Buffer.from(delimiter),
    Buffer.from(filePartHeader),
    Buffer.from(fileBuffer),
    Buffer.from(closeDelimiter),
  );

  const body = Buffer.concat(parts);

  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length.toString(),
    },
    body,
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
