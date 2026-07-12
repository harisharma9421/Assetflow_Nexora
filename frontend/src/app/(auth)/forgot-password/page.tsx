import type { Metadata } from "next";
import AuthPageWrapper from "@/features/auth/components/AuthPageWrapper";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Nexora",
  description: "Reset your Nexora account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageWrapper variant="forgot">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-sm text-[hsl(var(--color-muted-foreground))]">
          No worries — we&apos;ll send you reset instructions
        </p>
      </div>

      {/* Form */}
      <ForgotPasswordForm />
    </AuthPageWrapper>
  );
}

