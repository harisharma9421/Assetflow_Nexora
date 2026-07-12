/**
 * Auth route group layout
 * Clean centered layout for login and register pages
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Assetra",
  description: "Sign in to your Assetra account to manage assets and resources.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-muted))]">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
