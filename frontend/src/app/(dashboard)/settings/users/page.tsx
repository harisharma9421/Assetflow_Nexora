"use client";

import { ShieldCheck, UserCog, Users } from "lucide-react";
import { ModuleWorkbench } from "@/components/shared";

export default function UserManagementPage() {
  return (
    <ModuleWorkbench
      title="User Management"
      description="Admin-only workspace for reviewing users, departments, role assignment, and account status."
      endpoint="/users"
      stats={[
        { title: "Access Control", value: "RBAC", description: "Four clear platform roles", icon: <ShieldCheck className="h-5 w-5" /> },
        { title: "Directory", value: "Active users", description: "Synced from backend users API", icon: <Users className="h-5 w-5" /> },
        { title: "Role Updates", value: "Admin only", description: "Promotion uses protected backend routes", icon: <UserCog className="h-5 w-5" /> },
      ]}
      columns={[
        { key: "id", header: "User ID" },
        { key: "fullName", header: "Name" },
        { key: "email", header: "Email" },
        { key: "departmentId", header: "Department" },
        { key: "roleName", header: "Role", kind: "status" },
        { key: "status", header: "Status", kind: "status" },
      ]}
      emptyTitle="No users found"
      emptyDescription="Registered employees and administrators will appear here."
    />
  );
}
