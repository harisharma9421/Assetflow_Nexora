import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity Logs | Assetra" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Activity Logs
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Full audit trail of all system actions
      </p>
    </div>
  );
}
