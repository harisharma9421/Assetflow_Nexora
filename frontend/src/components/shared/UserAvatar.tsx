"use client";

import React from "react";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = getInitials(name || "User");
  
  // Hash name string to get a consistent soft colored background
  const getBackgroundColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
      "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
      "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
      "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const sizes = {
    sm: "h-8 w-8 text-xs font-semibold rounded-full",
    md: "h-10 w-10 text-sm font-semibold rounded-full",
    lg: "h-12 w-12 text-base font-semibold rounded-full",
    xl: "h-16 w-16 text-xl font-semibold rounded-full",
  };

  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 shadow-inner",
        sizes[size],
        !imageUrl || hasError ? getBackgroundColor(name) : "bg-slate-100",
        className
      )}
    >
      {imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={name}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default UserAvatar;
