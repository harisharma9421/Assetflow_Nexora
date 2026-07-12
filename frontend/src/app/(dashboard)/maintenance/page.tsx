"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Plus,
  Search,
  X,
  FileCheck2,
  AlertCircle,
  CheckCircle,
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

interface MaintenanceTicket {
  id: number;
  assetId: number;
  assetTag: string;
  assetName: string;
  issueDescription: string;
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  startDate: string;
  endDate?: string;
  status: "Pending" | "In Progress" | "Resolved";
}

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  status: string;
}

const mockTickets: MaintenanceTicket[] = [
  {
    id: 1,
    assetId: 3,
    assetTag: "NX-MD-2088",
    assetName: "ICU Ventilator Series X",
    issueDescription: "Digital touchscreen interface occasionally freezes during boot cycle.",
    priority: "High",
    assignedTo: "Dr. Mark R. (MedTech)",
    startDate: "2026-07-10",
    status: "In Progress",
  },
  {
    id: 2,
    assetId: 1,
    assetTag: "NX-HW-1024",
    assetName: "MacBook Pro 16 M3",
    issueDescription: "Battery replacement cycle needed - capacity at 74%.",
    priority: "Medium",
    assignedTo: "IT Support Desk",
    startDate: "2026-07-11",
    status: "Pending",
  },
];

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal state
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  // Form state for logging maintenance
  const [newTicket, setNewTicket] = useState({
    assetId: "",
    issueDescription: "",
    priority: "Medium",
    assignedTo: "IT Support Desk",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load active tickets
        setTickets(mockTickets);

        // Fetch assets to load into target dropdown
        const assetsRes = await api.get("/assets");
        setAssets(assetsRes.data && assetsRes.data.length > 0 ? assetsRes.data : [
          { id: 1, assetTag: "NX-HW-1024", name: "MacBook Pro 16 M3", status: "Allocated" },
          { id: 2, assetTag: "NX-HW-1025", name: "Dell UltraSharp 32 Monitor", status: "Available" },
          { id: 3, assetTag: "NX-MD-2088", name: "ICU Ventilator Series X", status: "Under Maintenance" },
        ]);
      } catch {
        setTickets(mockTickets);
        setAssets([
          { id: 1, assetTag: "NX-HW-1024", name: "MacBook Pro 16 M3", status: "Allocated" },
          { id: 2, assetTag: "NX-HW-1025", name: "Dell UltraSharp 32 Monitor", status: "Available" },
          { id: 3, assetTag: "NX-MD-2088", name: "ICU Ventilator Series X", status: "Under Maintenance" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle logging new maintenance
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.assetId || !newTicket.issueDescription) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      // 1. API: log ticket (usually updates status of asset to Under Maintenance)
      await api.patch(`/assets/${newTicket.assetId}/status`, {
        status: "Under Maintenance",
        notes: `Maintenance log: ${newTicket.issueDescription}`,
      });
      toast.success("Maintenance log created. Asset status set to Under Maintenance!");
      setIsLogOpen(false);
      window.location.reload();
    } catch {
      // Mock flow if backend offline
      const targetAsset = assets.find((a) => a.id === parseInt(newTicket.assetId)) || assets[0];
      const newlyLogged: MaintenanceTicket = {
        id: Math.floor(Math.random() * 1000) + 10,
        assetId: targetAsset.id,
        assetTag: targetAsset.assetTag,
        assetName: targetAsset.name,
        issueDescription: newTicket.issueDescription,
        priority: newTicket.priority as "High" | "Medium" | "Low",
        assignedTo: newTicket.assignedTo,
        startDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      };

      setTickets((prev) => [newlyLogged, ...prev]);
      toast.success("Demo Mode: Created maintenance ticket in local list.");
      setIsLogOpen(false);
      setNewTicket({
        assetId: "",
        issueDescription: "",
        priority: "Medium",
        assignedTo: "IT Support Desk",
      });
    }
  };

  // Handle resolving maintenance ticket
  const handleResolveConfirm = async () => {
    if (!selectedTicket) return;

    try {
      // 1. API: resolve maintenance and restore status to Available
      await api.patch(`/assets/${selectedTicket.assetId}/status`, {
        status: "Available",
        notes: "Maintenance resolved successfully.",
      });
      toast.success("Asset repaired and restored back to Available status!");
      setIsResolveOpen(false);
      setSelectedTicket(null);
      window.location.reload();
    } catch {
      // Mock flow if backend offline
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, status: "Resolved" as "Pending" | "In Progress" | "Resolved", endDate: new Date().toISOString().split("T")[0] }
            : t
        )
      );
      toast.success("Demo Mode: Marked ticket as Resolved.");
      setIsResolveOpen(false);
      setSelectedTicket(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.assetName.toLowerCase().includes(search.toLowerCase()) ||
      t.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      t.issueDescription.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || t.priority.toUpperCase() === priorityFilter.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || t.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const columns = [
    { key: "assetTag", header: "Asset Tag", className: "font-mono font-bold text-xs" },
    { key: "assetName", header: "Asset Name", className: "font-semibold" },
    {
      key: "priority",
      header: "Priority",
      render: (row: MaintenanceTicket) => (
        <span
          className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
            row.priority === "High"
              ? "bg-red-50 border-red-200 text-red-650"
              : row.priority === "Medium"
              ? "bg-amber-50 border-amber-200 text-amber-650"
              : "bg-slate-50 border-slate-200 text-slate-650"
          }`}
        >
          {row.priority}
        </span>
      ),
    },
    { key: "issueDescription", header: "Issue Details", className: "max-w-[200px] truncate text-xs text-slate-500" },
    { key: "assignedTo", header: "Assigned Tech" },
    { key: "startDate", header: "Logged Date" },
    {
      key: "status",
      header: "Status",
      render: (row: MaintenanceTicket) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row: MaintenanceTicket) =>
        row.status !== "Resolved" && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(row);
              setIsResolveOpen(true);
            }}
            className="rounded-lg h-7 font-bold bg-white text-indigo-600 hover:bg-slate-50"
          >
            Resolve
          </Button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Maintenance Requests"
        breadcrumbs={[{ label: "Maintenance" }]}
        actions={
          <Button
            leftIcon={<Plus className="h-4.5 w-4.5" />}
            onClick={() => setIsLogOpen(true)}
            className="rounded-xl"
          >
            Log Request
          </Button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unresolved Issues</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {tickets.filter((t) => t.status !== "Resolved").length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Priority</span>
            <div className="rounded-lg bg-red-50 p-2 text-red-650">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {tickets.filter((t) => t.priority === "High" && t.status !== "Resolved").length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Repairs</span>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {tickets.filter((t) => t.status === "Resolved").length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tag, name, issue description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium focus:border-indigo-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-655 bg-white focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-655 bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSkeleton variant="table" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTickets}
            emptyTitle="No maintenance tickets found"
          />
        )}
      </div>

      {/* Log Request Dialog */}
      <AnimatePresence>
        {isLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogOpen(false)}
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
                  <Wrench className="h-5 w-5 text-indigo-600" /> Log Maintenance Ticket
                </h3>
                <button onClick={() => setIsLogOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">
                {/* Select Asset */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Select Target Asset *</label>
                  <select
                    required
                    value={newTicket.assetId}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, assetId: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                  >
                    <option value="">Select Asset to Repair</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} - {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Priority Category *</label>
                  <select
                    required
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, priority: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                  >
                    <option value="High">High (Immediate Action)</option>
                    <option value="Medium">Medium (Routine Service)</option>
                    <option value="Low">Low (Minor Calibration)</option>
                  </select>
                </div>

                {/* Assign Technician */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Assigned Technician / Desk</label>
                  <input
                    type="text"
                    value={newTicket.assignedTo}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="e.g. IT Helpdesk, BioMed Tech, External Vendor"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none bg-slate-50/50"
                  />
                </div>

                {/* Issue Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Issue Description *</label>
                  <textarea
                    required
                    value={newTicket.issueDescription}
                    onChange={(e) => setNewTicket((prev) => ({ ...prev, issueDescription: e.target.value }))}
                    placeholder="Describe exactly what needs repair..."
                    className="h-20 rounded-xl border border-slate-200 p-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsLogOpen(false)} className="rounded-xl h-10 px-5">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl h-10 px-6 bg-indigo-600 text-white">
                    Submit Request
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolve Confirmation Dialog */}
      <AnimatePresence>
        {isResolveOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsResolveOpen(false); setSelectedTicket(null); }}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl z-10 flex flex-col gap-5 dark:bg-slate-900 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <FileCheck2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Resolve Maintenance Request</h3>
                <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Are you confirming that the issue with **{selectedTicket.assetName}** ({selectedTicket.assetTag}) has been resolved?
                  This action marks the asset as **Available** for future allocations.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsResolveOpen(false); setSelectedTicket(null); }}
                  className="rounded-xl h-10 px-5 flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleResolveConfirm}
                  className="rounded-xl h-10 px-6 bg-indigo-600 text-white flex-1"
                >
                  Confirm Resolution
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
