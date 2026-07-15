export async function sendTelegramPhoto(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  caption: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram environment variables are missing.");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendPhoto`;

  try {
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");


    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
    formData.append("photo", blob, fileName);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send telegram photo:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram API Error:", error);
    return false;
  }
}

export async function sendTelegramPhotoByUrl(
  photoUrl: string,
  caption: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram environment variables are missing.");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendPhoto`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send telegram photo by url:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram API Error:", error);
    return false;
  }
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram environment variables are missing.");
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send telegram message:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Telegram API Error:", error);
    return false;
  }
}
