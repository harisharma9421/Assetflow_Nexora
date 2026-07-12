"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps {
  variant?: "card" | "row" | "list" | "table" | "chart";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant = "row",
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-[hsl(var(--radius))] border border-[hsl(var(--color-border))] bg-white p-6 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-8 rounded-lg bg-slate-200" />
                </div>
                <div className="mt-4 h-8 w-24 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        );
      case "table":
        return (
          <div className="w-full rounded-[hsl(var(--radius))] border border-[hsl(var(--color-border))] bg-white p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="h-8 w-48 rounded bg-slate-200" />
              <div className="h-8 w-24 rounded bg-slate-200" />
              <div className="ml-auto h-8 w-32 rounded bg-slate-200" />
            </div>
            <div className="flex flex-col gap-3.5 pt-4">
              {items.map((_, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="h-4 w-12 rounded bg-slate-200" />
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="h-4 w-28 rounded bg-slate-200" />
                  <div className="h-4 w-20 rounded bg-slate-200" />
                  <div className="ml-auto h-8 w-8 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        );
      case "chart":
        return (
          <div
            className={cn(
              "w-full rounded-[hsl(var(--radius))] border border-[hsl(var(--color-border))] bg-white p-6 shadow-sm animate-pulse flex flex-col gap-4",
              className
            )}
          >
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-2 w-48 rounded bg-slate-100" />
            <div className="mt-4 flex items-end gap-3 h-48 w-full justify-between pt-4">
              <div className="h-[20%] w-full rounded bg-slate-200" />
              <div className="h-[50%] w-full rounded bg-slate-200" />
              <div className="h-[35%] w-full rounded bg-slate-200" />
              <div className="h-[80%] w-full rounded bg-slate-200" />
              <div className="h-[65%] w-full rounded bg-slate-200" />
              <div className="h-[45%] w-full rounded bg-slate-200" />
              <div className="h-[90%] w-full rounded bg-slate-200" />
            </div>
          </div>
        );
      case "list":
        return (
          <div className="flex flex-col gap-4 animate-pulse">
            {items.map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-[hsl(var(--radius))] border border-[hsl(var(--color-border))] bg-white p-4 shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-3 w-[40%] rounded bg-slate-200" />
                  <div className="h-3.5 w-[75%] rounded bg-slate-200" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200 shrink-0" />
              </div>
            ))}
          </div>
        );
      case "row":
      default:
        return (
          <div className={cn("flex flex-col gap-3 animate-pulse", className)}>
            {items.map((_, idx) => (
              <div key={idx} className="h-4 rounded bg-slate-200 w-full" />
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
}

export default LoadingSkeleton;
