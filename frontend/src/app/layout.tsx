import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nexora – Enterprise Asset & Resource Management",
    template: "%s | Nexora",
  },
  description:
    "Nexora is an intelligent ERP platform for managing physical assets, shared resources, maintenance workflows, and organizational audits — all in one place.",
  keywords: [
    "asset management",
    "ERP",
    "resource management",
    "maintenance",
    "audit",
    "enterprise",
  ],
  authors: [{ name: "Nexora" }],
  creator: "Nexora",
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))]" suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}

