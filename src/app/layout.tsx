import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHVRKU.RECON©2026",
  description: "Design & engineering. Thinking in systems. Designing with care.",
  metadataBase: new URL("https://shvrku.recon.asia"),
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon", sizes: "any" }],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  openGraph: {
    title: "SHVRKU.RECON©2026",
    description: "Design & engineering. Thinking in systems. Designing with care.",
    url: "https://shvrku.recon.asia",
    siteName: "SHVRKU.RECON",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SHVRKU.RECON" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHVRKU.RECON©2026",
    description: "Design & engineering. Thinking in systems. Designing with care.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
