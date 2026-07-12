"use client";

import { BarChart3, Download, PackageSearch } from "lucide-react";
import { ModuleWorkbench } from "@/components/shared";

export default function ReportsPage() {
  return (
    <ModuleWorkbench
      title="Reports & Analytics"
      description="Operational reporting for utilization, maintenance frequency, department allocation, booking heatmaps, and exports."
      endpoint="/reports/asset-utilization"
      stats={[
        { title: "Utilization", value: "Live", description: "Backend asset-utilization report", icon: <BarChart3 className="h-5 w-5" /> },
        { title: "Exports", value: "PDF / Excel", description: "Export services are available in backend", icon: <Download className="h-5 w-5" /> },
        { title: "Inventory Insight", value: "Ranked assets", description: "Allocation and booking frequency", icon: <PackageSearch className="h-5 w-5" /> },
      ]}
      columns={[
        { key: "assetId", header: "Asset ID" },
        { key: "assetTag", header: "Tag" },
        { key: "name", header: "Asset" },
        { key: "timesAllocated", header: "Allocations" },
        { key: "totalDaysAllocated", header: "Allocated Days" },
        { key: "timesBooked", header: "Bookings" },
      ]}
      emptyTitle="No report data"
      emptyDescription="Asset utilization data will appear when allocation or booking history exists."
    />
  );
}
