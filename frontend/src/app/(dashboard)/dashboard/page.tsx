import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Assetra" };

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Overview of assets, resources, and operational health
      </p>
    </div>
  );
}
