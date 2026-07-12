import Link from "next/link";
import { Zap } from "lucide-react";
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
        {/* Clickable Brand Logo Header */}
        <Link href="/" className="mb-6 flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Nexora
          </span>
        </Link>

        {/* Floating Auth Card */}
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl shadow-slate-150/10 dark:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
