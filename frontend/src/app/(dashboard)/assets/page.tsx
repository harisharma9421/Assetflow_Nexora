import type { Metadata } from "next";

export const metadata: Metadata = { title: "Assets | Nexora" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Assets
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Manage and track all organizational assets
      </p>
    </div>
  );
}

