import type { Metadata } from "next";

export const metadata: Metadata = { title: "Departments | Assetra" };

export default function DepartmentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">
        Departments
      </h1>
      <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
        Manage departments and their configurations
      </p>
    </div>
  );
}
