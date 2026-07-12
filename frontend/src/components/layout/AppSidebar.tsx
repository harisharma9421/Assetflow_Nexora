"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  UserCheck,
  CalendarDays,
  Wrench,
  FileCheck2,
  GitCompare,
  BarChart3,
  Bell,
  History,
  Users,
  Building2,
  Building,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/auth.types";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, currentRole, logout } = useAuth();
  const adminRoles = [USER_ROLES.ADMIN] as UserRole[];
  const managerRoles = [USER_ROLES.ADMIN, USER_ROLES.ASSET_MANAGER] as UserRole[];
  const approverRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSET_MANAGER,
    USER_ROLES.DEPARTMENT_HEAD,
  ] as UserRole[];
  const allRoles = [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSET_MANAGER,
    USER_ROLES.DEPARTMENT_HEAD,
    USER_ROLES.EMPLOYEE,
  ] as UserRole[];

  const primaryNavigation: NavigationItem[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: allRoles },
    { label: "Assets Directory", href: ROUTES.ASSETS, icon: Package, roles: allRoles },
    { label: "Allocations", href: ROUTES.ALLOCATIONS, icon: UserCheck, roles: approverRoles },
    { label: "Resource Bookings", href: ROUTES.BOOKINGS, icon: CalendarDays, roles: allRoles },
    { label: "Maintenance Requests", href: ROUTES.MAINTENANCE, icon: Wrench, roles: allRoles },
    { label: "Audits & Registers", href: ROUTES.AUDITS, icon: FileCheck2, roles: approverRoles },
    { label: "Asset Transfers", href: ROUTES.TRANSFERS, icon: GitCompare, roles: approverRoles },
  ];

  const utilityNavigation: NavigationItem[] = [
    { label: "Reports & Analytics", href: ROUTES.REPORTS, icon: BarChart3, roles: approverRoles },
    { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: Bell, roles: allRoles },
    { label: "Activity Logs", href: ROUTES.ACTIVITY_LOGS, icon: History, roles: managerRoles },
  ];

  const settingsNavigation: NavigationItem[] = [
    { label: "User Management", href: ROUTES.SETTINGS.USERS, icon: Users, roles: adminRoles },
    { label: "Departments", href: ROUTES.SETTINGS.DEPARTMENTS, icon: Building2, roles: adminRoles },
    { label: "Organization", href: ROUTES.SETTINGS.ORGANIZATION, icon: Building, roles: adminRoles },
  ];

  const visibleItems = (items: NavigationItem[]) =>
    items.filter((item) => !item.roles || (currentRole && item.roles.includes(currentRole)));

  const renderNavList = (items: NavigationItem[]) => (
    <ul className="flex flex-col gap-1 px-3">
      {visibleItems(items).map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-[hsl(var(--color-sidebar-muted-foreground))] hover:bg-[hsl(var(--color-sidebar-accent))] hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--color-sidebar))] text-[hsl(var(--color-sidebar-foreground))] border-r border-[hsl(var(--color-sidebar-border))]">
      {/* Brand logo */}
      <Link href="/" className="flex h-16 items-center gap-2.5 px-6 border-b border-[hsl(var(--color-sidebar-border))] hover:opacity-90 transition-opacity">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white">
            Nexora
          </span>
          <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
            ERP
          </span>
        </div>
      </Link>

      {/* Navigation areas */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-7">
        <div>
          <span className="block px-6 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--color-sidebar-muted-foreground))] mb-3">
            Core Modules
          </span>
          {renderNavList(primaryNavigation)}
        </div>

        <div>
          <span className="block px-6 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--color-sidebar-muted-foreground))] mb-3">
            Management
          </span>
          {renderNavList(utilityNavigation)}
        </div>

        {visibleItems(settingsNavigation).length > 0 && (
        <div>
          <span className="block px-6 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--color-sidebar-muted-foreground))] mb-3">
            Settings
          </span>
          {renderNavList(settingsNavigation)}
        </div>
        )}
      </div>

      {/* User block & logout */}
      <div className="border-t border-[hsl(var(--color-sidebar-border))] p-4">
        <div className="flex items-center gap-3 rounded-xl bg-[hsl(var(--color-sidebar-muted))] p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-sidebar-accent))] font-bold text-white shrink-0 uppercase">
            {user?.fullName?.substring(0, 2) || "US"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {user?.fullName || "Active User"}
            </p>
            <p className="text-[10px] font-medium text-[hsl(var(--color-sidebar-muted-foreground))] truncate">
              {user?.roleName || "Employee"}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-[hsl(var(--color-sidebar-muted-foreground))] hover:bg-[hsl(var(--color-sidebar-accent))] hover:text-white transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
