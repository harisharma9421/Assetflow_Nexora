import type { Metadata } from "next";

export const metadata: Metadata = { title: "Maintenance | Nexora" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Maintenance
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Maintenance requests and schedules
      </p>
    </div>
  );
}

