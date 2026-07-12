"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[hsl(var(--radius))] border border-dashed border-[hsl(var(--color-border))] bg-white p-12 text-center shadow-sm dark:bg-slate-900/20",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-[hsl(var(--color-muted-foreground))] dark:bg-slate-800 shrink-0">
        {icon || <FolderOpen className="h-8 w-8 text-slate-400" />}
      </div>
      
      <h3 className="mt-6 text-lg font-semibold text-[hsl(var(--color-foreground))]">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[hsl(var(--color-muted-foreground))]">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-6"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
