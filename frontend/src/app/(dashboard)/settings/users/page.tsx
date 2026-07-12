import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Management | Nexora" };

export default function UserManagementPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        User Management
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Manage users, roles and permissions
      </p>
    </div>
  );
}

