"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  change?: number; // e.g. 12.5 or -3.2
  changeLabel?: string; // e.g. "vs last month"
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  change,
  changeLabel = "vs last month",
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[hsl(var(--radius))] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-muted-foreground))]">
          {title}
        </span>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[hsl(var(--color-primary))] dark:bg-slate-800 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[hsl(var(--color-foreground))] sm:text-3xl">
          {value}
        </span>
        {change !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full",
              isPositive
                ? "text-[hsl(var(--color-success))] bg-green-50 dark:bg-green-950/20"
                : "text-[hsl(var(--color-destructive))] bg-red-50 dark:bg-red-950/20"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 shrink-0" />
            ) : (
              <ArrowDownRight className="h-3 w-3 shrink-0" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      {(description || (change !== undefined && changeLabel)) && (
        <p className="mt-2 text-xs text-[hsl(var(--color-muted-foreground))]">
          {description || changeLabel}
        </p>
      )}
    </div>
  );
}

export default StatCard;
