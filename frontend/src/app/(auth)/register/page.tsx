import type { Metadata } from "next";
import AuthPageWrapper from "@/features/auth/components/AuthPageWrapper";
import SignupForm from "@/features/auth/components/SignupForm";

export const metadata: Metadata = {
  title: "Create Account | Nexora",
  description:
    "Create your Nexora employee account to get started with asset management and resource booking.",
};

export default function RegisterPage() {
  return (
    <AuthPageWrapper variant="signup">
      {/* Header */}
      <div className="mb-7">
        {/* Mobile logo */}
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-base font-bold text-[hsl(var(--color-foreground))]">
            Nexora
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-[hsl(var(--color-muted-foreground))]">
          Join your organization on Nexora
        </p>
      </div>

      {/* Signup Form */}
      <SignupForm />
    </AuthPageWrapper>
  );
}

