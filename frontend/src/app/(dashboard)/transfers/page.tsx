import type { Metadata } from "next";

export const metadata: Metadata = { title: "Transfers | Assetra" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Transfers
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Manage inter-department asset transfers
      </p>
    </div>
  );
}
