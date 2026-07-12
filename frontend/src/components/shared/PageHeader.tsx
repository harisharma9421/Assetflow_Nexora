"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbLink {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbLink[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 pb-6 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex flex-col gap-1.5">
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--color-muted-foreground))]" aria-label="Breadcrumb">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 hover:text-[hsl(var(--color-foreground))] transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.label}>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[hsl(var(--color-foreground))] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[hsl(var(--color-foreground))] font-semibold">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title & Description */}
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--color-foreground))] sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            {description}
          </p>
        )}
      </div>

      {/* Right Actions Slot */}
      {actions && (
        <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
