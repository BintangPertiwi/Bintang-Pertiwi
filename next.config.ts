import type { NextConfig } from "next";

// Header keamanan dasar (non-CSP agar tidak memecah styling/analytics).
// CSP penuh bisa ditambahkan menyusul setelah diuji terhadap inline style,
// framer-motion, Vercel analytics, Cloudinary, dan wa.me.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Hanya izinkan host gambar yang benar-benar dipakai (Cloudinary).
    // JANGAN pakai hostname "**" — itu menjadikan /_next/image proxy terbuka (SSRF/abuse).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
