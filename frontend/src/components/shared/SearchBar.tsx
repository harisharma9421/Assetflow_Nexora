"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search resources...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "block h-10 w-full rounded-xl border border-[hsl(var(--color-border))] bg-white pl-9 pr-8 text-sm placeholder:text-[hsl(var(--color-muted-foreground))] transition-colors focus:border-[hsl(var(--color-ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))/0.2] dark:bg-slate-950",
          className
        )}
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
