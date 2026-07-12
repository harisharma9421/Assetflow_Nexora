import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Assetra – Enterprise Asset & Resource Management",
    template: "%s | Assetra",
  },
  description:
    "Assetra is an intelligent ERP platform for managing physical assets, shared resources, maintenance workflows, and organizational audits — all in one place.",
  keywords: [
    "asset management",
    "ERP",
    "resource management",
    "maintenance",
    "audit",
    "enterprise",
  ],
  authors: [{ name: "Assetra" }],
  creator: "Assetra",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
