"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppSidebar from "@/components/layout/AppSidebar";
import AppTopbar from "@/components/layout/AppTopbar";
import { LoadingSkeleton } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES, USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/auth.types";

const routePermissions: Array<{ prefix: string; roles: UserRole[] }> = [
  {
    prefix: ROUTES.SETTINGS.PROFILE,
    roles: [
      USER_ROLES.ADMIN,
      USER_ROLES.ASSET_MANAGER,
      USER_ROLES.DEPARTMENT_HEAD,
      USER_ROLES.EMPLOYEE,
    ],
  },
  {
    prefix: ROUTES.SETTINGS.ROOT,
    roles: [USER_ROLES.ADMIN],
  },
  {
    prefix: ROUTES.ACTIVITY_LOGS,
    roles: [USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER],
  },
  {
    prefix: ROUTES.REPORTS,
    roles: [USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER, USER_ROLES.DEPARTMENT_HEAD],
  },
  {
    prefix: ROUTES.ALLOCATIONS,
    roles: [USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER, USER_ROLES.DEPARTMENT_HEAD],
  },
  {
    prefix: ROUTES.TRANSFERS,
    roles: [USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER, USER_ROLES.DEPARTMENT_HEAD],
  },
  {
    prefix: ROUTES.AUDITS,
    roles: [USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER, USER_ROLES.DEPARTMENT_HEAD],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentRole, isAuthenticated } = useAuth();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const requiredRoles = routePermissions.find((item) =>
    pathname.startsWith(item.prefix)
  )?.roles;
  const isForbidden =
    hasHydrated &&
    isAuthenticated &&
    requiredRoles &&
    (!currentRole || !requiredRoles.includes(currentRole));

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (isForbidden) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [hasHydrated, isAuthenticated, isForbidden, router]);

  if (!hasHydrated || !isAuthenticated || isForbidden) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-3xl">
          <LoadingSkeleton variant="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--color-background))]">
      {/* Left Sidebar Shell (desktop only) */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <AppSidebar />
      </aside>

      {/* Main content right panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar header bar */}
        <header className="flex h-16 w-full items-center border-b border-border shrink-0 bg-card">
          <AppTopbar />
        </header>

        {/* Page content window */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
