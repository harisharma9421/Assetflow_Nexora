"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  // Asset status
  AVAILABLE: { label: "Available", variant: "success" },
  ALLOCATED: { label: "Allocated", variant: "info" },
  RESERVED: { label: "Reserved", variant: "warning" },
  UNDER_MAINTENANCE: { label: "Under Maintenance", variant: "warning" },
  LOST: { label: "Lost", variant: "danger" },
  RETIRED: { label: "Retired", variant: "neutral" },
  DISPOSED: { label: "Disposed", variant: "neutral" },

  // Allocation status
  ACTIVE: { label: "Active", variant: "info" },
  RETURNED: { label: "Returned", variant: "success" },
  OVERDUE: { label: "Overdue", variant: "danger" },

  // Booking & Maintenance status
  PENDING: { label: "Pending", variant: "warning" },
  PENDING_APPROVAL: { label: "Pending Approval", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },

  // Audit status
  SCHEDULED: { label: "Scheduled", variant: "info" },
  VERIFIED: { label: "Verified", variant: "success" },
  MISSING: { label: "Missing", variant: "danger" },
  DAMAGED: { label: "Damaged", variant: "danger" },
  UNVERIFIED: { label: "Unverified", variant: "warning" },

  // Common
  Active: { label: "Active", variant: "success" },
  Inactive: { label: "Inactive", variant: "neutral" },
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const lookup = statusMap[status] || statusMap[status.toUpperCase()] || {
    label: status,
    variant: "neutral" as BadgeVariant,
  };

  const activeVariant = variant || lookup.variant;

  const styles = {
    success: "bg-green-50 text-[hsl(var(--color-success))] border-green-200 dark:bg-green-950/20 dark:border-green-900/30",
    warning: "bg-amber-50 text-[hsl(var(--color-warning))] border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30",
    danger: "bg-red-50 text-[hsl(var(--color-destructive))] border-red-200 dark:bg-red-950/20 dark:border-red-900/30",
    info: "bg-indigo-50 text-[hsl(var(--color-primary))] border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30",
    neutral: "bg-slate-50 text-[hsl(var(--color-muted-foreground))] border-slate-200 dark:bg-slate-900 dark:border-slate-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        styles[activeVariant],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          activeVariant === "success" && "bg-[hsl(var(--color-success))]",
          activeVariant === "warning" && "bg-[hsl(var(--color-warning))]",
          activeVariant === "danger" && "bg-[hsl(var(--color-destructive))]",
          activeVariant === "info" && "bg-[hsl(var(--color-primary))]",
          activeVariant === "neutral" && "bg-[hsl(var(--color-muted-foreground))]"
        )}
      />
      {lookup.label}
    </span>
  );
}

export default StatusBadge;
