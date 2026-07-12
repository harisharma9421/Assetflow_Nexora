"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: "success" | "warning" | "danger" | "info" | "neutral";
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-green-500 ring-green-100 dark:ring-green-950";
      case "warning":
        return "bg-amber-500 ring-amber-100 dark:ring-amber-950";
      case "danger":
        return "bg-rose-500 ring-rose-100 dark:ring-rose-950";
      case "info":
        return "bg-indigo-500 ring-indigo-100 dark:ring-indigo-950";
      case "neutral":
      default:
        return "bg-slate-400 ring-slate-100 dark:ring-slate-800";
    }
  };

  return (
    <div className={cn("flow-root", className)}>
      <ul className="-mb-8">
        {items.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {/* Vertical connecting line */}
              {idx !== items.length - 1 && (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  {/* Bubble circle container */}
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl text-white ring-8",
                      getStatusColor(item.status)
                    )}
                  >
                    {item.icon || (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-[hsl(var(--color-muted-foreground))] font-medium shrink-0 pt-0.5">
                    <time dateTime={item.timestamp}>{item.timestamp}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Timeline;
