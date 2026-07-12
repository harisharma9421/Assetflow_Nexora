import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports & Analytics | Nexora" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Reports & Analytics
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Analytics, reports and exports
      </p>
    </div>
  );
}

