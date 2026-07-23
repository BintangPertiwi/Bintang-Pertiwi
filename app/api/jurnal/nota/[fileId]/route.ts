import { getFileFromTelegram } from "@/lib/telegram-storage";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    if (!fileId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const buffer = await getFileFromTelegram(fileId);

    // Return the image buffer directly to the browser
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving Telegram image:", error);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
