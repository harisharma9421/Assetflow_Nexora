"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Plus,
  Search,
  Calendar,
  User,
  Building,
  ArrowRightLeft,
  AlertTriangle,
  X,
  FileCheck2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  DataTable,
  StatusBadge,
  LoadingSkeleton,
} from "@/components/shared";

interface Allocation {
  id: number;
  assetId: number;
  assetTag: string;
  assetName: string;
  holderType: "Employee" | "Department";
  holderName: string;
  allocationDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: "Active" | "Returned" | "Overdue";
}

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  status: string;
}

interface Employee {
  id: number;
  fullName: string;
  email: string;
}

interface Department {
  id: number;
  name: string;
}

interface BackendAllocation {
  id: number;
  assetId: number;
  holderType: "Employee" | "Department" | string;
  holderEmployeeId: number | null;
  holderDepartmentId: number | null;
  allocationDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string | null;
  status: string;
}

const mockEmployees = [
  { id: 10, fullName: "Sarah Jenkins", email: "sarah.j@nexora.co" },
  { id: 11, fullName: "David Miller", email: "david.m@nexora.co" },
  { id: 12, fullName: "Robert Chen", email: "robert.c@nexora.co" },
];

const mockDepartments = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Operations" },
  { id: 3, name: "Design" },
];

const mockAllocations: Allocation[] = [
  {
    id: 50,
    assetId: 1,
    assetTag: "NX-HW-1024",
    assetName: "MacBook Pro 16 M3",
    holderType: "Employee",
    holderName: "Sarah Jenkins",
    allocationDate: "2026-06-15",
    expectedReturnDate: "2026-07-15",
    status: "Active",
  },
  {
    id: 51,
    assetId: 3,
    assetTag: "NX-MD-2088",
    assetName: "ICU Ventilator Series X",
    holderType: "Department",
    holderName: "Clinical Medicine",
    allocationDate: "2026-04-10",
    expectedReturnDate: "2026-06-10",
    status: "Overdue",
  },
];

export default function AllocationsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal Dialogs state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

  // Form state for new checkout (using function initializer for component purity)
  const [checkoutForm, setCheckoutForm] = useState(() => ({
    assetId: "",
    holderType: "Employee",
    holderEmployeeId: "",
    holderDepartmentId: "",
    expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days default
  }));

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [empRes, deptRes, allocationRes] = await Promise.allSettled([
          api.get("/users"),
          api.get("/departments"),
          api.get<BackendAllocation[]>("/allocations"),
        ]);

        if (empRes.status === "fulfilled") setEmployees(empRes.value.data);
        else setEmployees(mockEmployees);

        if (deptRes.status === "fulfilled") setDepartments(deptRes.value.data);
        else setDepartments(mockDepartments);

        if (allocationRes.status === "fulfilled") {
          setAllocations(
            allocationRes.value.data.map((allocation) => ({
              id: allocation.id,
              assetId: allocation.assetId,
              assetTag: `Asset #${allocation.assetId}`,
              assetName: `Asset #${allocation.assetId}`,
              holderType: allocation.holderType === "Department" ? "Department" : "Employee",
              holderName:
                allocation.holderEmployeeId !== null
                  ? `Employee #${allocation.holderEmployeeId}`
                  : allocation.holderDepartmentId !== null
                    ? `Department #${allocation.holderDepartmentId}`
                    : "Unassigned holder",
              allocationDate: allocation.allocationDate,
              expectedReturnDate: allocation.expectedReturnDate,
              actualReturnDate: allocation.actualReturnDate ?? undefined,
              status:
                allocation.status === "Returned"
                  ? "Returned"
                  : allocation.status === "Overdue"
                    ? "Overdue"
                    : "Active",
            }))
          );
        } else {
          setAllocations(mockAllocations);
        }

        // Fetch available assets for checkout dropdown
        const assetsRes = await api.get("/assets?status=AVAILABLE");
        setAvailableAssets(assetsRes.data && assetsRes.data.length > 0 ? assetsRes.data : [
          { id: 2, assetTag: "NX-HW-1025", name: "Dell UltraSharp 32 Monitor", status: "Available" },
        ]);
      } catch (err) {
        setEmployees(mockEmployees);
        setDepartments(mockDepartments);
        setAllocations(mockAllocations);
        setAvailableAssets([
          { id: 2, assetTag: "NX-HW-1025", name: "Dell UltraSharp 32 Monitor", status: "Available" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle Checkout submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.assetId || (checkoutForm.holderType === "Employee" && !checkoutForm.holderEmployeeId) || (checkoutForm.holderType === "Department" && !checkoutForm.holderDepartmentId)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        assetId: parseInt(checkoutForm.assetId),
        holderType: checkoutForm.holderType,
        holderEmployeeId: checkoutForm.holderType === "Employee" ? parseInt(checkoutForm.holderEmployeeId) : null,
        holderDepartmentId: checkoutForm.holderType === "Department" ? parseInt(checkoutForm.holderDepartmentId) : null,
        allocatedBy: currentUser?.id,
        expectedReturnDate: checkoutForm.expectedReturnDate,
      };

      if (!payload.allocatedBy) {
        toast.error("Your session does not include a user id. Please log in again.");
        return;
      }

      await api.post("/allocations", payload);
      toast.success("Asset checkout completed successfully!");
      setIsCheckoutOpen(false);
      // Reload page state
      window.location.reload();
    } catch {
      // Mock flow if backend offline
      const targetAsset = availableAssets.find((a) => a.id === parseInt(checkoutForm.assetId)) || availableAssets[0];
      const holderName = checkoutForm.holderType === "Employee" 
        ? (employees.find((e) => e.id === parseInt(checkoutForm.holderEmployeeId))?.fullName || "Employee User")
        : (departments.find((d) => d.id === parseInt(checkoutForm.holderDepartmentId))?.name || "Department Unit");

      const newAlloc: Allocation = {
        id: Math.floor(Math.random() * 1000) + 100,
        assetId: targetAsset.id,
        assetTag: targetAsset.assetTag,
        assetName: targetAsset.name,
        holderType: checkoutForm.holderType as "Employee" | "Department",
        holderName,
        allocationDate: new Date().toISOString().split("T")[0],
        expectedReturnDate: checkoutForm.expectedReturnDate,
        status: "Active",
      };

      setAllocations((prev) => [newAlloc, ...prev]);
      setAvailableAssets((prev) => prev.filter((a) => a.id !== targetAsset.id));
      toast.success("Demo Mode: Checkout allocated in local state.");
      setIsCheckoutOpen(false);
    }
  };

  // Handle Return confirmation
  const handleReturnConfirm = async () => {
    if (!selectedAllocation) return;

    try {
      if (!currentUser?.id) {
        toast.error("Your session does not include a user id. Please log in again.");
        return;
      }

      await api.post(`/allocations/${selectedAllocation.id}/return`, {
        returnedTo: currentUser.id,
        actualReturnDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Asset returned and marked as Available!");
      setIsReturnOpen(false);
      setSelectedAllocation(null);
      // Reload page state
      window.location.reload();
    } catch {
      // Mock flow if backend offline
      setAllocations((prev) =>
        prev.map((a) =>
          a.id === selectedAllocation.id
            ? { ...a, status: "Returned" as "Active" | "Returned" | "Overdue", actualReturnDate: new Date().toISOString().split("T")[0] }
            : a
        )
      );
      toast.success("Demo Mode: Marked as returned in local list.");
      setIsReturnOpen(false);
      setSelectedAllocation(null);
    }
  };

  // Filter allocation list
  const filteredAllocations = allocations.filter((a) => {
    const matchesSearch =
      a.assetName.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      a.holderName.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || a.holderType.toUpperCase() === typeFilter.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || a.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    { key: "assetTag", header: "Asset Tag", className: "font-mono font-bold text-xs" },
    { key: "assetName", header: "Asset Name", className: "font-semibold" },
    {
      key: "holderName",
      header: "Assigned To",
      render: (row: Allocation) => (
        <div className="flex items-center gap-2">
          {row.holderType === "Employee" ? (
            <User className="h-4 w-4 text-slate-400" />
          ) : (
            <Building className="h-4 w-4 text-slate-400" />
          )}
          <span className="font-semibold text-slate-900">{row.holderName}</span>
        </div>
      ),
    },
    { key: "allocationDate", header: "Allocated Date" },
    { key: "expectedReturnDate", header: "Expected Return" },
    {
      key: "status",
      header: "Status",
      render: (row: Allocation) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row: Allocation) => (
        row.status !== "Returned" && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAllocation(row);
              setIsReturnOpen(true);
            }}
            className="rounded-lg h-7 font-bold"
          >
            Check-In
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Asset Allocations"
        breadcrumbs={[{ label: "Allocations" }]}
        actions={
          <Button
            leftIcon={<Plus className="h-4.5 w-4.5" />}
            onClick={() => setIsCheckoutOpen(true)}
            className="rounded-xl"
            disabled={availableAssets.length === 0}
          >
            New Allocation
          </Button>
        }
      />

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Allocations</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {allocations.filter((a) => a.status !== "Returned").length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Alerts</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {allocations.filter((a) => a.status === "Overdue").length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checkout Options</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {availableAssets.length} Available
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
              placeholder="Search allocations by tag, asset, or holder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium focus:border-indigo-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-650 bg-white focus:outline-none"
            >
              <option value="ALL">All Holders</option>
              <option value="EMPLOYEE">Employees Only</option>
              <option value="DEPARTMENT">Departments Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-650 bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="OVERDUE">Overdue</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Allocations Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSkeleton variant="table" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAllocations}
            emptyTitle="No allocations found"
          />
        )}
      </div>

      {/* ─── NEW ALLOCATION DIALOG ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
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
                  <UserCheck className="h-5 w-5 text-indigo-600" /> Checkout / Allocate Asset
                </h3>
                <button onClick={() => setIsCheckoutOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                {/* Select Asset */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Available Asset *</label>
                  <select
                    required
                    value={checkoutForm.assetId}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, assetId: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                  >
                    <option value="">Select Asset to Allocate</option>
                    {availableAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Holder Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Assignee Type *</label>
                  <div className="flex gap-4">
                    {["Employee", "Department"].map((t) => (
                      <label key={t} className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="holderType"
                          checked={checkoutForm.holderType === t}
                          onChange={() => setCheckoutForm((prev) => ({ ...prev, holderType: t, holderEmployeeId: "", holderDepartmentId: "" }))}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Holder selectors */}
                {checkoutForm.holderType === "Employee" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Select Employee *</label>
                    <select
                      required
                      value={checkoutForm.holderEmployeeId}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, holderEmployeeId: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-650 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Select Department *</label>
                    <select
                      required
                      value={checkoutForm.holderDepartmentId}
                      onChange={(e) => setCheckoutForm((prev) => ({ ...prev, holderDepartmentId: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-650 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Expected Return Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    value={checkoutForm.expectedReturnDate}
                    onChange={(e) => setCheckoutForm((prev) => ({ ...prev, expectedReturnDate: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)} className="rounded-xl h-10 px-5">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl h-10 px-6 bg-indigo-600 text-white">
                    Confirm Checkout
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── RETURN CHECK-IN CONFIRMATION DIALOG ───────────────────────────── */}
      <AnimatePresence>
        {isReturnOpen && selectedAllocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsReturnOpen(false); setSelectedAllocation(null); }}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl z-10 flex flex-col gap-5 dark:bg-slate-900 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <FileCheck2 className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Asset Return</h3>
                <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Are you checking in the asset **{selectedAllocation.assetName}** ({selectedAllocation.assetTag}) from **{selectedAllocation.holderName}**?
                  This action returns the asset status back to **Available** in the directory.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsReturnOpen(false); setSelectedAllocation(null); }}
                  className="rounded-xl h-10 px-5 flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleReturnConfirm}
                  className="rounded-xl h-10 px-6 bg-indigo-600 text-white flex-1"
                >
                  Confirm Check-In
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
