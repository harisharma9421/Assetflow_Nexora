import type { Metadata } from "next";

export const metadata: Metadata = { title: "Organization Settings | Nexora" };

export default function OrganizationSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Organization Settings
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Manage organization profile, logo and settings
      </p>
    </div>
  );
}

