"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  UserCheck,
  Wrench,
  CalendarDays,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  StatCard,
  StatusBadge,
  UserAvatar,
  Timeline,
  DataTable,
} from "@/components/shared";

// ─── MOCK DATA FOR DEMONSTRATION ──────────────────────────────────────────────

const assetUtilizationData = [
  { month: "Jan", allocated: 65, maintenance: 12, available: 23 },
  { month: "Feb", allocated: 70, maintenance: 8, available: 22 },
  { month: "Mar", allocated: 78, maintenance: 10, available: 12 },
  { month: "Apr", allocated: 82, maintenance: 15, available: 3 },
  { month: "May", allocated: 80, maintenance: 14, available: 6 },
  { month: "Jun", allocated: 85, maintenance: 9, available: 6 },
];

const categoryDistribution = [
  { name: "Electronics", value: 45, color: "#4F46E5" },
  { name: "Furniture", value: 25, color: "#10B981" },
  { name: "Vehicles", value: 15, color: "#F59E0B" },
  { name: "Lab Equipment", value: 15, color: "#EC4899" },
];

const recentActivities = [
  {
    id: 1,
    title: "Dell Latitude 5420 Allocated",
    description: "Assigned to Sarah Jenkins (Engineering Dept) by Admin",
    timestamp: "10 mins ago",
    status: "info" as const,
    icon: <UserCheck className="h-4.5 w-4.5" />,
  },
  {
    id: 2,
    title: "Maintenance Completed",
    description: "Projector AF-889 returned to Available status after lamp replacement",
    timestamp: "2 hours ago",
    status: "success" as const,
    icon: <Wrench className="h-4.5 w-4.5" />,
  },
  {
    id: 3,
    title: "New Asset Registered",
    description: "MacBook Pro M3 (SN: C02JX78K) added to Lab Equipment",
    timestamp: "4 hours ago",
    status: "neutral" as const,
    icon: <Package className="h-4.5 w-4.5" />,
  },
  {
    id: 4,
    title: "Audit Discrepancy Flagged",
    description: "Projector AF-102 noted as 'Missing' during Annual Stock Audit",
    timestamp: "Yesterday",
    status: "danger" as const,
    icon: <AlertCircle className="h-4.5 w-4.5" />,
  },
];

const upcomingReturns = [
  {
    id: "RET-101",
    asset: "MacBook Pro 16\"",
    holder: "Alex Mercer",
    dueDate: "2026-07-15",
    status: "ACTIVE",
  },
  {
    id: "RET-102",
    asset: "Sony Projector",
    holder: "Marketing Lab",
    dueDate: "2026-07-12",
    status: "OVERDUE",
  },
  {
    id: "RET-103",
    asset: "iPad Air Gen 5",
    holder: "David K.",
    dueDate: "2026-07-18",
    status: "ACTIVE",
  },
];

const pendingMaintenance = [
  {
    id: "MTN-204",
    asset: "Laser Cutter v2",
    issue: "Calibrator failure",
    priority: "Critical",
    status: "PENDING",
  },
  {
    id: "MTN-205",
    asset: "Tesla Charger 3",
    issue: "No power delivery",
    priority: "High",
    status: "IN_PROGRESS",
  },
  {
    id: "MTN-206",
    asset: "Office Desk Chair",
    issue: "Broken hydraulic lift",
    priority: "Low",
    status: "PENDING",
  },
];

const latestAssets = [
  {
    id: "AST-1001",
    tag: "NX-8890",
    name: "MacBook Pro M3",
    category: "Electronics",
    condition: "New",
    status: "AVAILABLE",
  },
  {
    id: "AST-1002",
    tag: "NX-3212",
    name: "Dell UltraSharp 32\"",
    category: "Electronics",
    condition: "Good",
    status: "ALLOCATED",
  },
  {
    id: "AST-1003",
    tag: "NX-7789",
    name: "Conference Room Pod",
    category: "Furniture",
    condition: "Good",
    status: "RESERVED",
  },
  {
    id: "AST-1004",
    tag: "NX-1045",
    name: "Oscilloscope Rig B",
    category: "Lab Equipment",
    condition: "Fair",
    status: "UNDER_MAINTENANCE",
  },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const userName = user?.fullName || "Operator";
  const orgName = "Nexora ERP Platform";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ─── WELCOME BANNER ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-36 w-36 rounded-full bg-blue-500/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar name={userName} size="lg" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {orgName} · Administrator
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mt-0.5">
                Welcome back, {userName}!
              </h2>
              <p className="text-xs text-muted-foreground">
                Here is your operational overview for Nexora Resource Management today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/assets">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PlusCircle className="h-4 w-4" />}
                className="h-10 rounded-xl"
              >
                Quick Register
              </Button>
            </Link>
            <Link href="/allocations">
              <Button
                variant="primary"
                size="sm"
                className="h-10 rounded-xl"
              >
                New Allocation
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ─── STATISTICS CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assets"
          value="1,482"
          change={8.2}
          changeLabel="vs last quarter"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Active Allocations"
          value="892"
          change={12.4}
          changeLabel="vs last month"
          icon={<UserCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Maintenance"
          value="14"
          change={-5.8}
          changeLabel="vs last week"
          icon={<Wrench className="h-5 w-5" />}
        />
        <StatCard
          title="Room & Resource Bookings"
          value="128"
          change={2.1}
          changeLabel="vs last month"
          icon={<CalendarDays className="h-5 w-5" />}
        />
      </div>

      {/* ─── CHARTS & METRICS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Utilization Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Asset Allocation Trends
              </h3>
              <p className="text-xs text-muted-foreground">
                Historical split of active, idle and maintenance states.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground border border-border">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span>+14% Utilized</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetUtilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  stackId="1"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorAllocated)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown pie chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground">
            Category Distribution
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Percentage split of registered physical assets.
          </p>
          <div className="flex items-center justify-center h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-semibold text-foreground truncate">
                  {cat.name} ({cat.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── GRID: RECENT ACTIVITIES, ACTION PANELS ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Activities Timeline */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">
                Real-Time Logs
              </h3>
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <Timeline items={recentActivities} />
          </div>
          <Link href="/activity-logs" className="self-start mt-4">
            <Button
              variant="link"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="text-xs font-bold text-primary"
            >
              View all activity logs
            </Button>
          </Link>
        </div>

        {/* Center Column: Upcoming Returns & Notifications */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">
              Upcoming Returns
            </h3>
            <div className="flex flex-col gap-3">
              {upcomingReturns.map((ret) => (
                <div
                  key={ret.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-3 hover:bg-muted transition-colors duration-150"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {ret.asset}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Holder: {ret.holder} · Due: {ret.dueDate}
                    </p>
                  </div>
                  <StatusBadge status={ret.status} />
                </div>
              ))}
            </div>
          </div>
          <Link href="/allocations" className="self-start mt-4">
            <Button
              variant="link"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="text-xs font-bold text-primary"
            >
              Manage active allocations
            </Button>
          </Link>
        </div>

        {/* Right Column: Pending Maintenance Requests */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">
              Pending Maintenance
            </h3>
            <div className="flex flex-col gap-3">
              {pendingMaintenance.map((maint) => (
                <div
                  key={maint.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-3 hover:bg-muted transition-colors duration-150"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {maint.asset}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Issue: {maint.issue} · Priority: {maint.priority}
                    </p>
                  </div>
                  <StatusBadge status={maint.status} />
                </div>
              ))}
            </div>
          </div>
          <Link href="/maintenance" className="self-start mt-4">
            <Button
              variant="link"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="text-xs font-bold text-primary"
            >
              Open maintenance center
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── LATEST ASSETS TABLE ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Recently Registered Assets
            </h3>
            <p className="text-xs text-muted-foreground">
              Physical inventory checked in during the last 48 hours.
            </p>
          </div>
          <Link href="/assets">
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
              className="h-9 text-xs font-semibold rounded-xl bg-card hover:bg-muted"
            >
              Inventory Directory
            </Button>
          </Link>
        </div>

        <DataTable
          columns={[
            { key: "tag", header: "Asset Tag" },
            { key: "name", header: "Asset Name" },
            { key: "category", header: "Category" },
            {
              key: "condition",
              header: "Condition",
              render: (row) => (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-muted text-foreground border border-border">
                  {row.condition}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
          data={latestAssets}
        />
      </div>
    </div>
  );
}
