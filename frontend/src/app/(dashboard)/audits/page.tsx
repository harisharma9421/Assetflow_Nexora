"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck2,
  Plus,
  Search,
  ClipboardList,
  User,
  X,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  LoadingSkeleton,
} from "@/components/shared";

interface AuditCycle {
  id: number;
  title: string;
  startDate: string;
  endDate?: string;
  totalAssetsCount: number;
  verifiedCount: number;
  mismatchCount: number;
  status: "In Progress" | "Completed" | "Pending Review";
}

const mockAudits: AuditCycle[] = [
  {
    id: 1,
    title: "Q3 IT Infrastructure Count",
    startDate: "2026-07-01",
    totalAssetsCount: 45,
    verifiedCount: 41,
    mismatchCount: 4,
    status: "In Progress",
  },
  {
    id: 2,
    title: "Annual Hospital Ventilator Audit",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    totalAssetsCount: 22,
    verifiedCount: 22,
    mismatchCount: 0,
    status: "Completed",
  },
];

export default function AuditsPage() {
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal Dialogs state
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);

  // Form state
  const [newAudit, setNewAudit] = useState({
    title: "",
    categoryId: "ALL",
    departmentId: "ALL",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setAudits(mockAudits);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleNewAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAudit.title) {
      toast.error("Please specify a name for the audit cycle.");
      return;
    }

    const createdAudit: AuditCycle = {
      id: Math.floor(Math.random() * 1000) + 10,
      title: newAudit.title,
      startDate: new Date().toISOString().split("T")[0],
      totalAssetsCount: 25, // Mocked scope size
      verifiedCount: 0,
      mismatchCount: 0,
      status: "In Progress",
    };

    setAudits((prev) => [createdAudit, ...prev]);
    toast.success("Stock count audit cycle started successfully!");
    setIsNewAuditOpen(false);
    setNewAudit({ title: "", categoryId: "ALL", departmentId: "ALL" });
  };

  const filteredAudits = audits.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: "title", header: "Audit Title", className: "font-semibold text-slate-900" },
    { key: "startDate", header: "Started Date" },
    { key: "endDate", header: "Closed Date", render: (row: AuditCycle) => row.endDate || "-" },
    {
      key: "progress",
      header: "Verified Scope",
      render: (row: AuditCycle) => (
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <div className="flex justify-between text-[10px] font-bold text-slate-450">
            <span>{row.verifiedCount} / {row.totalAssetsCount} Verified</span>
            <span>{Math.round((row.verifiedCount / row.totalAssetsCount) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(row.verifiedCount / row.totalAssetsCount) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "mismatchCount",
      header: "Mismatches",
      render: (row: AuditCycle) => (
        <span
          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold ${
            row.mismatchCount > 0
              ? "bg-red-50 text-red-650 border border-red-200"
              : "bg-green-50 text-green-650 border border-green-200"
          }`}
        >
          {row.mismatchCount} Discrepancy
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: AuditCycle) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row: AuditCycle) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            toast.info(`Opening register details for "${row.title}"`);
          }}
          className="rounded-lg h-7 font-bold bg-white text-indigo-600 hover:bg-slate-50"
        >
          View Register
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Audits & Registers"
        breadcrumbs={[{ label: "Audits" }]}
        actions={
          <Button
            leftIcon={<Plus className="h-4.5 w-4.5" />}
            onClick={() => setIsNewAuditOpen(true)}
            className="rounded-xl"
          >
            Start Audit
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Audits</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {audits.filter((a) => a.status === "In Progress").length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Discrepancies</span>
            <div className="rounded-lg bg-red-50 p-2 text-red-650">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">4 Unresolved</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Accuracy</span>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">91.1% Accuracy</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit cycles by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium focus:border-indigo-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-655 bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSkeleton variant="table" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAudits}
            emptyTitle="No audits found"
          />
        )}
      </div>

      {/* New Audit Form Dialog */}
      <AnimatePresence>
        {isNewAuditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewAuditOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl z-10 flex flex-col gap-5 dark:bg-slate-900"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5 text-indigo-600" /> Start Stock Count Audit
                </h3>
                <button onClick={() => setIsNewAuditOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleNewAuditSubmit} className="flex flex-col gap-4">
                {/* Audit Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Audit Title *</label>
                  <input
                    type="text"
                    required
                    value={newAudit.title}
                    onChange={(e) => setNewAudit((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Q4 Science Lab Inventory Audit"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>

                {/* Scope Filters */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Category Scope</label>
                  <select
                    value={newAudit.categoryId}
                    onChange={(e) => setNewAudit((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="1">IT Hardware</option>
                    <option value="2">Office Furniture</option>
                    <option value="3">Lab Equipment</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Department Scope</label>
                  <select
                    value={newAudit.departmentId}
                    onChange={(e) => setNewAudit((prev) => ({ ...prev, departmentId: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="1">Engineering</option>
                    <option value="2">Human Resources</option>
                    <option value="3">Operations</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsNewAuditOpen(false)} className="rounded-xl h-10 px-5">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl h-10 px-6 bg-indigo-600 text-white">
                    Start Audit Cycle
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
