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
    <div className="flex min-h-screen">
      {/* Left — Illustration (desktop only) */}
      <div className="hidden lg:block lg:w-[42%] xl:w-[45%] flex-shrink-0">
        <AuthIllustration variant={variant} />
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[hsl(var(--color-muted)/0.3)] px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
