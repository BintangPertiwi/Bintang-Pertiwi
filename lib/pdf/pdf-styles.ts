export const PDF_COLORS = {
  primary: [165, 224, 10], // #a5e00a
  text: [15, 23, 42], // #0F172A (slate-900)
  muted: [100, 116, 139], // #64748B (slate-500)
  light: [241, 245, 249], // #F1F5F9 (slate-100)
  white: [255, 255, 255],
};

// Base64 of a 1x1 transparent pixel as extreme fallback
export const FALLBACK_LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export async function imageUrlToBase64(url: string): Promise<string> {
  if (!url) return FALLBACK_LOGO_BASE64;
  if (url.startsWith("data:image")) return url;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          resolve(FALLBACK_LOGO_BASE64);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return FALLBACK_LOGO_BASE64;
  }
}
