"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelector {
  name: string;
  key: string;
  options: FilterOption[];
}

export interface FilterBarProps {
  selectors: FilterSelector[];
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

export function FilterBar({
  selectors,
  filters,
  onChange,
  onClear,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(filters).some((val) => val !== "");

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--color-foreground))]">
        <Filter className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
        <span>Filters</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectors.map((selector) => (
          <select
            key={selector.key}
            value={filters[selector.key] || ""}
            onChange={(e) => onChange(selector.key, e.target.value)}
            className="h-10 rounded-xl border border-[hsl(var(--color-border))] bg-white px-3 text-sm font-medium text-[hsl(var(--color-foreground))] outline-none transition-colors focus:border-[hsl(var(--color-ring))] focus:ring-2 focus:ring-[hsl(var(--color-ring))/0.2] dark:bg-slate-950"
          >
            <option value="">All {selector.name}</option>
            {selector.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="h-10 text-xs font-semibold rounded-xl border border-dashed hover:bg-slate-50"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
