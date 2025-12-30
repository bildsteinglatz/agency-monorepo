import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://halle5.at'),
  title: {
    default: "Halle 5 | Ateliers & Werkstätten Dornbirn",
    template: "%s | Halle 5"
  },
  description: "Halle 5 — Offene Ateliers, Werkstätten, Kunstproduktion und Veranstaltungsort im Herzen von Dornbirn am Campus V.",
  keywords: ["Atelier", "Werkstatt", "Dornbirn", "Kunstproduktion", "Halle 5", "Vorarlberg", "Kultur", "Workshops", "Pinguin Atelier"],
  authors: [{ name: "Halle 5"}],
  creator: "Halle 5",
  publisher: "Halle 5",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: "https://halle5.at",
    siteName: "Halle 5",
    title: "Halle 5 | Ateliers & Werkstätten Dornbirn",
    description: "Offene Ateliers, Werkstätten und Kunstproduktion im Herzen von Dornbirn.",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Halle 5 | Ateliers & Werkstätten',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Halle 5 | Ateliers & Werkstätten Dornbirn",
    description: "Offene Ateliers, Werkstätten und Kunstproduktion im Herzen von Dornbirn.",
    images: ['/opengraph-image.png'],
  },
  icons: {
    icon: [
      { url: "/Halle-5.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/Halle-5.png", sizes: "512x512", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RightNavigation from "@/components/RightNavigation";
import { MotionProvider } from "@/components/MotionProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { StaffBar } from "@/components/staff/StaffBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <MotionProvider>
              <StaffBar />
              <Navigation />
              <RightNavigation />
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </MotionProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
