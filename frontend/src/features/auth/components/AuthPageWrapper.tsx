import React from "react";
import AuthIllustration from "@/features/auth/components/AuthIllustration";

interface AuthPageWrapperProps {
  children: React.ReactNode;
  variant?: "login" | "signup" | "forgot";
}

/**
 * Two-column auth page layout:
 * - Left: Dark illustration panel (hidden on mobile, shows on lg+)
 * - Right: White form area
 */
export default function AuthPageWrapper({
  children,
  variant = "login",
}: AuthPageWrapperProps) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--color-background))]">
      {/* Left — Illustration (desktop only) */}
      <div className="hidden lg:block lg:w-[42%] xl:w-[45%] flex-shrink-0 border-r border-[hsl(var(--color-border))]">
        <AuthIllustration variant={variant} />
      </div>

      {/* Right — Form wrapper */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Floating Auth Card */}
        <div className="w-full max-w-md rounded-[hsl(var(--radius))] border border-[hsl(var(--color-border))] bg-white p-8 shadow-xl shadow-slate-100/60 dark:bg-slate-900/50 dark:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
