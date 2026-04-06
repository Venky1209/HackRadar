import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hackradar.vercel.app";

export const metadata: Metadata = {
  title: "HackRadar",
  description: "A curated hackathon radar for students and builders.",
  metadataBase: new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`),
  openGraph: {
    title: "HackRadar",
    description: "A curated hackathon radar for students and builders.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HackRadar",
    description: "A curated hackathon radar for students and builders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${manrope.variable} ${plexMono.variable} bg-background font-sans text-foreground antialiased`}>
        <div className="min-h-screen">{children}</div>
        <Toaster richColors closeButton position="top-right" theme="dark" />
      </body>
    </html>
  );
}
