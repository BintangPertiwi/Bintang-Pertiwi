import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bintangpertiwi.com"),
  title: "Web Profil dan Sistem Informasi Program PPM Bintang Pertiwi Pertamina EP Sangatta.",
  description: "Web Profil dan Sistem Informasi Program PPM Bintang Pertiwi Pertamina EP Sangatta.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bintang Pertiwi",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://bintangpertiwi.com",
    title: "Web Profil dan Sistem Informasi Program PPM Bintang Pertiwi Pertamina EP Sangatta.",
    description: "Web Profil dan Sistem Informasi Program PPM Bintang Pertiwi Pertamina EP Sangatta.",
    siteName: "Bintang Pertiwi",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Logo Bintang Pertiwi",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Profil dan Sistem Informasi Program PPM Bintang Pertiwi Pertamina EP Sangatta.",
    description: "Web Profil dan Sistem Informasi Program PPM Bintang Pertiwi Pertamina EP Sangatta.",
    images: ["/icon.png"],
  }
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
