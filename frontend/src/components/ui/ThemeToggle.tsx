"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "pill" | "icon";
  className?: string;
}

export function ThemeToggle({ variant = "pill", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    // Render a skeleton placeholder that matches the final size to prevent layout shift
    return (
      <div
        className={cn(
          variant === "pill"
            ? "h-9 w-[130px] rounded-full bg-muted border border-border animate-pulse"
            : "h-9 w-9 rounded-xl bg-muted border border-border animate-pulse",
          className
        )}
      />
    );
  }

  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={cn(
          "rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground",
          "transition-all duration-150 active:scale-95",
          className
        )}
      >
        {isDark ? (
          <Sun className="h-4.5 w-4.5 text-amber-500" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-indigo-500" />
        )}
      </button>
    );
  }

  // Pill variant — shows both options with active highlight
  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={cn(
        "flex items-center rounded-full border border-border bg-muted p-0.5 gap-0.5",
        className
      )}
    >
      <button
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
          !isDark
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className={cn("h-3.5 w-3.5 shrink-0", !isDark ? "text-amber-500" : "")} />
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
          isDark
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className={cn("h-3.5 w-3.5 shrink-0", isDark ? "text-indigo-400" : "")} />
        Dark
      </button>
    </div>
  );
}

export default ThemeToggle;
