import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPageWrapper from "@/features/auth/components/AuthPageWrapper";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Assetra",
  description: "Set a new password for your Assetra account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthPageWrapper variant="forgot">
      {/* Header */}
      <div className="mb-7">
        {/* Mobile logo */}
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-base font-bold text-[hsl(var(--color-foreground))]">
            Assetra
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">
          Set new password
        </h1>
        <p className="mt-1.5 text-sm text-[hsl(var(--color-muted-foreground))]">
          Your new password must be at least 8 characters
        </p>
      </div>

      {/* Form — wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageWrapper>
  );
}
