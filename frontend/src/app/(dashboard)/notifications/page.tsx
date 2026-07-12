import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications | Assetra" };

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Notifications
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        System notifications and alerts
      </p>
    </div>
  );
}
