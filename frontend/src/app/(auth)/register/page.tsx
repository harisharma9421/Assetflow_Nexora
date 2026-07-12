import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Assetra",
};

export default function RegisterPage() {
  return (
    <div className="rounded-lg border border-[hsl(var(--color-border))] bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
          Join your organization on Assetra
        </p>
      </div>
      {/* Registration form will be built in auth feature development phase */}
      <p className="text-center text-sm text-[hsl(var(--color-muted-foreground))]">
        Registration form coming soon...
      </p>
    </div>
  );
}
