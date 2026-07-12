"use client";

import { Bell, CheckCircle2, Clock } from "lucide-react";
import { ModuleWorkbench } from "@/components/shared";

export default function NotificationsPage() {
  return (
    <ModuleWorkbench
      title="Notifications"
      description="Track approvals, booking alerts, overdue returns, maintenance updates, and audit discrepancies assigned to the current user."
      endpoint="/notifications"
      stats={[
        { title: "Alert Center", value: "Live", description: "User-specific notifications", icon: <Bell className="h-5 w-5" /> },
        { title: "Read Status", value: "Tracked", description: "Unread items stay visible", icon: <CheckCircle2 className="h-5 w-5" /> },
        { title: "Time Ordered", value: "Recent first", description: "Newest alerts are prioritized", icon: <Clock className="h-5 w-5" /> },
      ]}
      columns={[
        { key: "type", header: "Type" },
        { key: "title", header: "Title" },
        { key: "message", header: "Message" },
        { key: "relatedEntityType", header: "Related To" },
        { key: "read", header: "Read", kind: "boolean" },
        { key: "createdAt", header: "Created", kind: "date" },
      ]}
      emptyTitle="No notifications"
      emptyDescription="Workflow alerts and system reminders will appear here."
    />
  );
}
