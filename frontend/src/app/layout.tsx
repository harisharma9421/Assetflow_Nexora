import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
