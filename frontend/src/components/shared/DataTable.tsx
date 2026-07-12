"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = "No data found",
  emptyDescription = "There are no records matching your query.",
  onRowClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSkeleton variant="table" count={5} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn("overflow-hidden rounded-[hsl(var(--radius))] border border-[hsl(var(--color-border))] bg-white shadow-sm dark:bg-slate-900/10", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-[hsl(var(--color-foreground))]">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-muted-foreground))] border-b border-[hsl(var(--color-border))] dark:bg-slate-800/40">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn("px-6 py-4.5 font-bold", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--color-border))]">
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/20",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-6 py-4 text-sm text-[hsl(var(--color-foreground))] font-medium group-hover:text-black transition-colors",
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[hsl(var(--color-border))] bg-white px-6 py-4 dark:bg-transparent">
          <div className="text-xs text-[hsl(var(--color-muted-foreground))] font-semibold">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              className="h-9 px-3 rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              className="h-9 px-3 rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
