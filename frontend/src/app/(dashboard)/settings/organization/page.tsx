"use client";

import { Building, Layers3, ShieldCheck } from "lucide-react";
import { ModuleWorkbench } from "@/components/shared";

export default function OrganizationPage() {
  return (
    <ModuleWorkbench
      title="Organization Setup"
      description="Centralized admin setup for the business structure that powers departments, users, categories, and role-based workflows."
      endpoint="/roles"
      stats={[
        { title: "Roles", value: "4", description: "Admin, Manager, Head, Employee", icon: <ShieldCheck className="h-5 w-5" /> },
        { title: "Structure", value: "Enterprise", description: "Designed for multi-department use", icon: <Building className="h-5 w-5" /> },
        { title: "Modules", value: "Connected", description: "Shared setup drives all workflows", icon: <Layers3 className="h-5 w-5" /> },
      ]}
      columns={[
        { key: "id", header: "Role ID" },
        { key: "name", header: "Role" },
        { key: "description", header: "Description" },
      ]}
      emptyTitle="No roles found"
      emptyDescription="Role master data should be seeded by the backend."
    />
  );
}
