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
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-foreground">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn("px-6 py-4 font-bold", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "transition-colors duration-100 hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-6 py-4 text-sm text-foreground font-medium",
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
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <div className="text-xs text-muted-foreground font-semibold">
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
