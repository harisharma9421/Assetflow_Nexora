"use client";

import { GitCompare, ShieldCheck, Timer } from "lucide-react";
import { ModuleWorkbench } from "@/components/shared";

export default function TransfersPage() {
  return (
    <ModuleWorkbench
      title="Asset Transfers"
      description="Review transfer requests, preserve custody history, and move assets between employees or departments through an approval workflow."
      endpoint="/transfers"
      stats={[
        { title: "Workflow", value: "Requested -> Approved", description: "Controlled transfer lifecycle", icon: <GitCompare className="h-5 w-5" /> },
        { title: "Traceability", value: "Full history", description: "Allocation lineage is preserved", icon: <ShieldCheck className="h-5 w-5" /> },
        { title: "SLA Focus", value: "Open queue", description: "Prioritize pending approvals", icon: <Timer className="h-5 w-5" /> },
      ]}
      columns={[
        { key: "id", header: "Request ID" },
        { key: "assetId", header: "Asset ID" },
        { key: "requestedBy", header: "Requested By" },
        { key: "requestedToEmployeeId", header: "To Employee" },
        { key: "requestedToDepartmentId", header: "To Department" },
        { key: "status", header: "Status", kind: "status" },
        { key: "requestedAt", header: "Requested", kind: "date" },
      ]}
      emptyTitle="No transfer requests"
      emptyDescription="Transfer requests created from allocated assets will appear here."
    />
  );
}
