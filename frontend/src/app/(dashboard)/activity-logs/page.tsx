"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  User,
  Clock,
  Database,
  Calendar,
  AlertCircle,
} from "lucide-react";

import api from "@/lib/api";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  LoadingSkeleton,
} from "@/components/shared";

interface ActivityLog {
  id: number;
  action: string;
  performedBy: string;
  entityType: string;
  entityId: number;
  timestamp: string;
  notes?: string;
}

const mockLogs: ActivityLog[] = [
  {
    id: 1,
    action: "Asset Allocated",
    performedBy: "Sarah Jenkins",
    entityType: "Asset",
    entityId: 1,
    timestamp: "2026-07-12 11:20:15",
    notes: "Allocated MacBook Pro (NX-HW-1024) to developer.",
  },
  {
    id: 2,
    action: "Maintenance Request Logged",
    performedBy: "Dr. Mark R.",
    entityType: "Maintenance",
    entityId: 3,
    timestamp: "2026-07-10 14:02:40",
    notes: "Logged digital touch screen freeze issue for ICU Ventilator.",
  },
  {
    id: 3,
    action: "User Registered",
    performedBy: "Admin User",
    entityType: "User",
    entityId: 10,
    timestamp: "2026-06-25 09:30:00",
    notes: "Created Sarah Jenkins profile in employee directory.",
  },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get("/activity-logs");
        setLogs(res.data && res.data.length > 0 ? res.data : mockLogs);
      } catch {
        setLogs(mockLogs);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredLogs = logs.filter((l) => {
    return (
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      (l.notes && l.notes.toLowerCase().includes(search.toLowerCase())) ||
      l.entityType.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      className: "text-slate-500 font-medium text-xs font-mono",
    },
    { key: "action", header: "Action", className: "font-semibold text-slate-900" },
    {
      key: "performedBy",
      header: "Operator",
      render: (row: ActivityLog) => (
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-450" />
          <span className="font-semibold text-slate-900">{row.performedBy}</span>
        </div>
      ),
    },
    {
      key: "entityType",
      header: "Target Module",
      render: (row: ActivityLog) => (
        <span className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          {row.entityType}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Audit Notes",
      className: "text-slate-500 text-xs font-medium max-w-sm truncate",
      render: (row: ActivityLog) => row.notes || "-",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Activity Audit Logs"
        breadcrumbs={[{ label: "Logs" }]}
      />

      {/* Overview Stats card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Operations Tracked</span>
            <span className="text-3xl font-extrabold text-slate-900">{logs.length} Operations</span>
          </div>
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <History className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search audit trail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium focus:border-indigo-600 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSkeleton variant="table" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredLogs}
            emptyTitle="No audit logs recorded"
          />
        )}
      </div>
    </div>
  );
}
