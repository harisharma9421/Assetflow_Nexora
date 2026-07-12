import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Assetra",
};

export default function LoginPage() {
  return (
    <div className="rounded-lg border border-[hsl(var(--color-border))] bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
          Welcome to Assetra
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
          Sign in to your account to continue
        </p>
      </div>
      {/* Login form will be built in auth feature development phase */}
      <p className="text-center text-sm text-[hsl(var(--color-muted-foreground))]">
        Login form coming soon...
      </p>
    </div>
  );
}
