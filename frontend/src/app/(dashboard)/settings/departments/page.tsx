"use client";

import { Building2, Network, Users } from "lucide-react";
import { ModuleWorkbench } from "@/components/shared";

export default function DepartmentsPage() {
  return (
    <ModuleWorkbench
      title="Departments"
      description="Maintain organizational departments used by assets, employees, allocations, audits, and reporting."
      endpoint="/departments"
      stats={[
        { title: "Master Data", value: "Departments", description: "Shared across core modules", icon: <Building2 className="h-5 w-5" /> },
        { title: "Hierarchy", value: "Parent links", description: "Supports nested teams", icon: <Network className="h-5 w-5" /> },
        { title: "Ownership", value: "Heads", description: "Department head accountability", icon: <Users className="h-5 w-5" /> },
      ]}
      columns={[
        { key: "id", header: "Department ID" },
        { key: "name", header: "Name" },
        { key: "code", header: "Code" },
        { key: "headUserId", header: "Head User" },
        { key: "parentDepartmentId", header: "Parent" },
        { key: "status", header: "Status", kind: "status" },
      ]}
      emptyTitle="No departments found"
      emptyDescription="Create department master data before assigning employees and assets."
    />
  );
}
