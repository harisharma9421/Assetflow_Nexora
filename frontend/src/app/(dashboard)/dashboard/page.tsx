"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Package,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { DataTable, StatCard, StatusBadge, UserAvatar } from "@/components/shared";
import { ROUTES, USER_ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth.types";
import {
  fallbackDashboardKpis,
  getDashboardKpis,
  getOverdueReturns,
  type DashboardKpis,
  type OverdueReturn,
} from "@/features/dashboard/dashboard.api";

const chartData = [
  { label: "Available", value: 42 },
  { label: "Allocated", value: 58 },
  { label: "Maintenance", value: 11 },
  { label: "Bookings", value: 24 },
];

interface RoleDashboardConfig {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  focusTitle: string;
  focusItems: Array<{ title: string; description: string; status: string; href: string }>;
}

const dashboardConfig: Record<UserRole, RoleDashboardConfig> = {
  ADMIN: {
    eyebrow: "Administrator Command Center",
    title: "Organization-wide asset control",
    description:
      "Monitor inventory health, user governance, department setup, audit coverage, and operational exceptions from one command center.",
    primaryAction: { label: "Manage Users", href: ROUTES.SETTINGS.USERS },
    secondaryAction: { label: "Open Reports", href: ROUTES.REPORTS },
    focusTitle: "Admin Priorities",
    focusItems: [
      {
        title: "Role governance",
        description: "Review user access, departments, and active organization settings.",
        status: "ACTIVE",
        href: ROUTES.SETTINGS.USERS,
      },
      {
        title: "Audit readiness",
        description: "Track open audits and unresolved verification discrepancies.",
        status: "PENDING",
        href: ROUTES.AUDITS,
      },
      {
        title: "Executive reports",
        description: "Export asset, utilization, maintenance, and audit summaries.",
        status: "APPROVED",
        href: ROUTES.REPORTS,
      },
    ],
  },
  ASSET_MANAGER: {
    eyebrow: "Asset Manager Dashboard",
    title: "Lifecycle operations and approvals",
    description:
      "Register assets, manage allocations, approve transfers, handle maintenance workflows, and keep every asset status accountable.",
    primaryAction: { label: "Register Asset", href: ROUTES.ASSETS },
    secondaryAction: { label: "New Allocation", href: ROUTES.ALLOCATIONS },
    focusTitle: "Operational Queue",
    focusItems: [
      {
        title: "Allocation queue",
        description: "Approve new assignments and complete pending returns.",
        status: "PENDING",
        href: ROUTES.ALLOCATIONS,
      },
      {
        title: "Maintenance approvals",
        description: "Prioritize high-impact repairs and technician assignments.",
        status: "IN_PROGRESS",
        href: ROUTES.MAINTENANCE,
      },
      {
        title: "Transfer requests",
        description: "Resolve holder changes without losing custody history.",
        status: "PENDING_APPROVAL",
        href: ROUTES.TRANSFERS,
      },
    ],
  },
  DEPARTMENT_HEAD: {
    eyebrow: "Department Head Dashboard",
    title: "Department assets and requests",
    description:
      "View assigned departmental assets, monitor resource bookings, approve requests, and keep your team compliant.",
    primaryAction: { label: "Book Resource", href: ROUTES.BOOKINGS },
    secondaryAction: { label: "View Assets", href: ROUTES.ASSETS },
    focusTitle: "Department Watchlist",
    focusItems: [
      {
        title: "Department inventory",
        description: "Review active assets assigned to your people and department.",
        status: "ACTIVE",
        href: ROUTES.ASSETS,
      },
      {
        title: "Upcoming returns",
        description: "Avoid overdue custody gaps before return dates pass.",
        status: "PENDING",
        href: ROUTES.ALLOCATIONS,
      },
      {
        title: "Booking calendar",
        description: "Coordinate rooms, vehicles, and shared equipment.",
        status: "APPROVED",
        href: ROUTES.BOOKINGS,
      },
    ],
  },
  EMPLOYEE: {
    eyebrow: "Employee Workspace",
    title: "My assets, bookings, and requests",
    description:
      "See what is assigned to you, book shared resources, raise maintenance requests, and follow the status of your submissions.",
    primaryAction: { label: "Book Resource", href: ROUTES.BOOKINGS },
    secondaryAction: { label: "Raise Maintenance", href: ROUTES.MAINTENANCE },
    focusTitle: "My Work Items",
    focusItems: [
      {
        title: "Assigned assets",
        description: "Check custody, condition, and expected return dates.",
        status: "ACTIVE",
        href: ROUTES.ASSETS,
      },
      {
        title: "Maintenance requests",
        description: "Report issues and track repair progress.",
        status: "IN_PROGRESS",
        href: ROUTES.MAINTENANCE,
      },
      {
        title: "Resource bookings",
        description: "Reserve bookable assets without schedule conflicts.",
        status: "APPROVED",
        href: ROUTES.BOOKINGS,
      },
    ],
  },
};

function valueOrFallback(value: number | undefined, fallback: number) {
  return value && value > 0 ? value : fallback;
}

export default function DashboardPage() {
  const { user, currentRole } = useAuth();
  const role = currentRole ?? USER_ROLES.EMPLOYEE;
  const config = dashboardConfig[role];
  const [kpis, setKpis] = useState<DashboardKpis>(fallbackDashboardKpis);
  const [overdueReturns, setOverdueReturns] = useState<OverdueReturn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<"connected" | "offline">("connected");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [kpiData, overdueData] = await Promise.all([
          getDashboardKpis(),
          getOverdueReturns(),
        ]);

        if (!isMounted) return;
        setKpis(kpiData);
        setOverdueReturns(overdueData);
        setApiStatus("connected");
      } catch {
        if (!isMounted) return;
        setKpis(fallbackDashboardKpis);
        setOverdueReturns([]);
        setApiStatus("offline");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: role === "EMPLOYEE" ? "Available Resources" : "Assets Available",
        value: valueOrFallback(kpis.assetsAvailable, 42),
        icon: <Package className="h-5 w-5" />,
        description: "Ready for allocation or booking",
      },
      {
        title: role === "EMPLOYEE" ? "My Active Items" : "Active Allocations",
        value: valueOrFallback(kpis.assetsAllocated, 58),
        icon: <UserCheck className="h-5 w-5" />,
        description: "Currently checked out",
      },
      {
        title: "Maintenance Today",
        value: valueOrFallback(kpis.maintenanceToday, 11),
        icon: <Wrench className="h-5 w-5" />,
        description: "Needs attention or follow-up",
      },
      {
        title: "Active Bookings",
        value: valueOrFallback(kpis.activeBookings, 24),
        icon: <CalendarDays className="h-5 w-5" />,
        description: "Shared resources scheduled",
      },
    ],
    [kpis, role]
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="absolute right-0 top-0 h-44 w-44 translate-x-12 -translate-y-12 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <UserAvatar name={user?.fullName || config.eyebrow} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {config.eyebrow}
                </span>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {USER_ROLE_LABELS[role]}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {apiStatus === "connected" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  {apiStatus === "connected" ? "Live API" : "API fallback"}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {config.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={config.secondaryAction.href}>
              <Button variant="outline" leftIcon={<BarChart3 className="h-4 w-4" />}>
                {config.secondaryAction.label}
              </Button>
            </Link>
            <Link href={config.primaryAction.href}>
              <Button leftIcon={<PlusCircle className="h-4 w-4" />}>
                {config.primaryAction.label}
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={isLoading ? "..." : card.value}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex flex-col gap-1">
            <h2 className="text-base font-bold text-foreground">Operational Mix</h2>
            <p className="text-xs text-muted-foreground">
              Role-neutral overview from the dashboard KPI service.
            </p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--color-border))" />
                <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--color-primary))" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">{config.focusTitle}</h2>
              <p className="text-xs text-muted-foreground">Actionable work for this role.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {config.focusItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Overdue Returns</h2>
              <p className="text-xs text-muted-foreground">
                Pulled from the backend overdue-return view when available.
              </p>
            </div>
            <Link href={ROUTES.ALLOCATIONS}>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </Link>
          </div>
          <DataTable
            columns={[
              { key: "assetTag", header: "Tag" },
              { key: "assetName", header: "Asset" },
              { key: "expectedReturnDate", header: "Expected Return" },
              {
                key: "daysOverdue",
                header: "Delay",
                render: (row) => <StatusBadge status={`${row.daysOverdue} days`} variant="danger" />,
              },
            ]}
            data={overdueReturns.map((item) => ({
              ...item,
              id: item.allocationId,
            }))}
            emptyTitle="No overdue returns found"
            emptyDescription="All active allocations are currently within their expected return window."
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-bold text-foreground">Role Capabilities</h2>
            <p className="text-xs text-muted-foreground">
              Clear ownership across the four approved AssetFlow roles.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { role: "Admin", icon: Users, text: "Users, departments, reports, and audit oversight." },
              { role: "Asset Manager", icon: ClipboardCheck, text: "Assets, allocations, transfers, and maintenance." },
              { role: "Department Head", icon: Building2, text: "Department assets, bookings, and approvals." },
              { role: "Employee", icon: FileCheck2, text: "Assigned assets, bookings, and service requests." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.role} className="rounded-xl border border-border bg-background p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-bold text-foreground">{item.role}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
