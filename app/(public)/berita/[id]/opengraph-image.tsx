import { ImageResponse } from "next/og";
import { getBeritaList } from "@/lib/google-sheets";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Berita Bintang Pertiwi";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getBeritaList();
  const berita = list.find(
    (b) => b.id === id && (b.status_publikasi === "Publik" || !b.status_publikasi)
  );

  // If berita has a cover image from Cloudinary, use it directly
  if (berita?.url_foto && berita.url_foto.includes("res.cloudinary.com")) {
    // Transform Cloudinary URL to optimal OG size
    let imageUrl = berita.url_foto;
    if (imageUrl.includes("/upload/")) {
      imageUrl = imageUrl.replace(
        "/upload/",
        "/upload/c_fill,w_1200,h_630,q_80,f_jpg/"
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
          }}
        >
          {/* Background image */}
          <img
            src={imageUrl}
            width={1200}
            height={630}
            style={{
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          {/* Dark gradient overlay at bottom for text */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "280px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "40px 48px",
            }}
          >
            {/* Category badge */}
            {berita.kategori && (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#a5e00a",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "12px",
                  display: "flex",
                }}
              >
                {berita.kategori}
              </div>
            )}
            {/* Title */}
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.2,
                display: "flex",
                maxWidth: "900px",
              }}
            >
              {berita.judul.length > 80
                ? berita.judul.substring(0, 80) + "..."
                : berita.judul}
            </div>
          </div>

          {/* Bottom accent bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "#a5e00a",
              display: "flex",
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    );
  }

  // Fallback: use logo-based OG image (same style as the root one)
  const logoData = await readFile(
    join(process.cwd(), "app/icon.png"),
    "base64"
  );
  const logoSrc = `data:image/png;base64,${logoData}`;

  const title = berita?.judul || "Berita Bintang Pertiwi";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 50%, #38bdf8 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            background: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        <img
          src={logoSrc}
          width={160}
          height={160}
          style={{
            borderRadius: "20px",
            marginBottom: "28px",
          }}
        />

        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.3,
            display: "flex",
          }}
        >
          {title.length > 100 ? title.substring(0, 100) + "..." : title}
        </div>

        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.8)",
            marginTop: "16px",
            display: "flex",
          }}
        >
          Bintang Pertiwi
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#a5e00a",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
