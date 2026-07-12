import type { Metadata } from "next";
import AuthPageWrapper from "@/features/auth/components/AuthPageWrapper";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | Nexora",
  description:
    "Sign in to Nexora to manage assets, track allocations, and access your organization's ERP dashboard.",
};

export default function LoginPage() {
  return (
    <AuthPageWrapper variant="login">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-sm text-[hsl(var(--color-muted-foreground))]">
          Enter your credentials to access the dashboard
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />
    </AuthPageWrapper>
  );
}

