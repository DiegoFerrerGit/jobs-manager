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
  metadataBase: new URL('https://www.thejobsmanager.com'),
  title: {
    default: 'The Jobs Manager',
    template: '%s · The Jobs Manager',
  },
  description:
    'Avisos de cientos de empresas, filtrados por si realmente contratan desde LATAM. Seguí tus procesos y escribí tu CV en un solo lugar.',
  openGraph: {
    type: 'website',
    siteName: 'The Jobs Manager',
    locale: 'es_AR',
    url: 'https://www.thejobsmanager.com',
    title: 'The Jobs Manager',
    description:
      'Avisos de cientos de empresas, filtrados por si realmente contratan desde LATAM.',
    images: [{
      url: '/branding/og-image.png',
      width: 1200,
      height: 630,
      alt: 'The Jobs Manager',
    }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
