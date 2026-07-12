"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Database,
  Building,
  Calendar,
  QrCode,
  Tag,
  History,
  X,
  PlusCircle,
  FileText,
  CheckCircle,
  Wrench,
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

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  description?: string;
  serialNumber?: string;
  qrCode?: string;
  categoryId: number;
  categoryName: string;
  status: string;
  departmentId: number;
  departmentName: string;
  location?: string;
  condition: string;
  price?: number;
  purchaseDate?: string;
}

interface AssetHistory {
  id: number;
  action: string;
  performedBy: string;
  date: string;
  notes?: string;
}

interface Category {
  id: number;
  name: string;
  code: string;
}

interface Department {
  id: number;
  name: string;
}

// Mock fallbacks (so the page is completely beautiful even if backend database is empty)
const mockCategories = [
  { id: 1, name: "IT Hardware", code: "HW" },
  { id: 2, name: "Office Furniture", code: "FN" },
  { id: 3, name: "Lab Equipment", code: "LB" },
  { id: 4, name: "Medical Devices", code: "MD" },
];

const mockDepartments = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Human Resources" },
  { id: 3, name: "Operations" },
  { id: 4, name: "Clinical Medicine" },
];

const mockAssets: Asset[] = [
  {
    id: 1,
    assetTag: "NX-HW-1024",
    name: "MacBook Pro 16 M3",
    description: "Developer work machine - Apple Silicon M3 Max",
    serialNumber: "C02F8480Q05D",
    categoryId: 1,
    categoryName: "IT Hardware",
    status: "Allocated",
    departmentId: 1,
    departmentName: "Engineering",
    location: "San Francisco - Floor 4",
    condition: "New",
    price: 3499,
    purchaseDate: "2026-01-15",
  },
  {
    id: 2,
    assetTag: "NX-HW-1025",
    name: "Dell UltraSharp 32 Monitor",
    description: "4K USB-C Hub Display for workspace design team",
    serialNumber: "MX04481024",
    categoryId: 1,
    categoryName: "IT Hardware",
    status: "Available",
    departmentId: 3,
    departmentName: "Operations",
    location: "San Francisco - Room 402",
    condition: "Good",
    price: 899,
    purchaseDate: "2025-11-20",
  },
  {
    id: 3,
    assetTag: "NX-MD-2088",
    name: "ICU Ventilator Series X",
    description: "Critical breathing assist system with digital monitor",
    serialNumber: "SN-VT-9921",
    categoryId: 4,
    categoryName: "Medical Devices",
    status: "Under Maintenance",
    departmentId: 4,
    departmentName: "Clinical Medicine",
    location: "Main Hospital - ICU Bay 2",
    condition: "Fair",
    price: 24500,
    purchaseDate: "2024-05-10",
  },
];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Panel / Dialog state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form state for creating a new asset
  const [newAsset, setNewAsset] = useState({
    name: "",
    description: "",
    categoryId: "",
    departmentId: "",
    serialNumber: "",
    location: "",
    condition: "New",
    purchaseDate: new Date().toISOString().split("T")[0],
    price: "",
  });

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load categories & departments
        const [catRes, deptRes] = await Promise.allSettled([
          api.get("/asset-categories"),
          api.get("/departments"),
        ]);

        if (catRes.status === "fulfilled") setCategories(catRes.value.data);
        else setCategories(mockCategories);

        if (deptRes.status === "fulfilled") setDepartments(deptRes.value.data);
        else setDepartments(mockDepartments);

        // Fetch assets
        const assetsRes = await api.get("/assets");
        setAssets(assetsRes.data && assetsRes.data.length > 0 ? assetsRes.data : mockAssets);
      } catch {
        // Fallback to mock data if backend not connected yet
        setCategories(mockCategories);
        setDepartments(mockDepartments);
        setAssets(mockAssets);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch QR & History when asset selected
  useEffect(() => {
    async function loadDetails() {
      if (!selectedAsset) {
        setQrCodeDataUrl(null);
        setAssetHistory([]);
        return;
      }

      // 1. Fetch QR
      try {
        const qrUrl = `${api.defaults.baseURL}/assets/${selectedAsset.id}/qr`;
        setQrCodeDataUrl(qrUrl);
      } catch {
        setQrCodeDataUrl(null);
      }

      // 2. Fetch history
      try {
        setHistoryLoading(true);
        const res = await api.get(`/assets/${selectedAsset.id}/history`);
        setAssetHistory(res.data?.lifecycle || []);
      } catch {
        // Mock history if backend fails
        setAssetHistory([
          { id: 1, action: "Asset Created", performedBy: "Admin User", date: selectedAsset.purchaseDate || "2026-01-15", notes: "Initial record registration" },
          { id: 2, action: "Status Updated", performedBy: "Sarah Jenkins", date: "2026-02-01", notes: `Marked status to ${selectedAsset.status}` },
        ]);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadDetails();
  }, [selectedAsset]);

  // Handle asset creation submit
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.categoryId || !newAsset.departmentId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        name: newAsset.name,
        description: newAsset.description,
        categoryId: parseInt(newAsset.categoryId),
        departmentId: parseInt(newAsset.departmentId),
        serialNumber: newAsset.serialNumber,
        location: newAsset.location,
        condition: newAsset.condition,
        purchaseDate: newAsset.purchaseDate,
        price: newAsset.price ? parseFloat(newAsset.price) : undefined,
      };

      const res = await api.post("/assets", payload);
      setAssets((prev) => [res.data, ...prev]);
      toast.success("Asset created successfully!");
      setIsCreateOpen(false);
      // Reset form
      setNewAsset({
        name: "",
        description: "",
        categoryId: "",
        departmentId: "",
        serialNumber: "",
        location: "",
        condition: "New",
        purchaseDate: new Date().toISOString().split("T")[0],
        price: "",
      });
    } catch {
      // Mock insert for frontend demo purposes if backend fails
      const selectedCat = categories.find((c) => c.id === parseInt(newAsset.categoryId)) || mockCategories[0];
      const selectedDept = departments.find((d) => d.id === parseInt(newAsset.departmentId)) || mockDepartments[0];
      
      const newlyCreated: Asset = {
        id: Math.floor(Math.random() * 1000) + 100,
        assetTag: `NX-${selectedCat.code}-${Math.floor(Math.random() * 9000) + 1000}`,
        name: newAsset.name,
        description: newAsset.description,
        serialNumber: newAsset.serialNumber,
        categoryId: selectedCat.id,
        categoryName: selectedCat.name,
        status: "Available",
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        location: newAsset.location || "San Francisco HQ",
        condition: newAsset.condition,
        price: newAsset.price ? parseFloat(newAsset.price) : undefined,
        purchaseDate: newAsset.purchaseDate,
      };

      setAssets((prev) => [newlyCreated, ...prev]);
      toast.success("Demo Mode: Created asset in temporary list.");
      setIsCreateOpen(false);
    }
  };

  // Filter asset list
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
      (a.location && a.location.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || a.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesCategory = categoryFilter === "ALL" || a.categoryId.toString() === categoryFilter;
    const matchesDepartment = departmentFilter === "ALL" || a.departmentId.toString() === departmentFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesDepartment;
  });

  const columns = [
    {
      key: "assetTag",
      header: "Asset Tag",
      className: "font-mono font-bold text-slate-900 text-xs",
    },
    {
      key: "name",
      header: "Name",
      render: (row: Asset) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.name}</span>
          <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{row.description}</span>
        </div>
      ),
    },
    { key: "categoryName", header: "Category" },
    { key: "departmentName", header: "Department" },
    {
      key: "status",
      header: "Status",
      render: (row: Asset) => <StatusBadge status={row.status} />,
    },
    {
      key: "condition",
      header: "Condition",
      render: (row: Asset) => (
        <span className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {row.condition}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Asset Directory"
        breadcrumbs={[{ label: "Assets" }]}
        actions={
          <Button
            leftIcon={<Plus className="h-4.5 w-4.5" />}
            onClick={() => setIsCreateOpen(true)}
            className="rounded-xl"
          >
            Create Asset
          </Button>
        }
      />

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assets</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">{assets.length}</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available</span>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {assets.filter((a) => a.status.toLowerCase() === "available").length}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Under Repair</span>
            <div className="rounded-lg bg-red-50 p-2 text-red-650">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {assets.filter((a) => a.status.toLowerCase() === "under maintenance").length}
          </span>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tag, name, serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium focus:border-indigo-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="UNDER MAINTENANCE">Under Maintenance</option>
              <option value="RESERVED">Reserved</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Assets Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSkeleton variant="table" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAssets}
            onRowClick={(row) => setSelectedAsset(row)}
            emptyTitle="No assets found matching filters"
          />
        )}
      </div>

      {/* ─── SLIDE OVER DETAILS PANEL (Drawer style) ─────────────────────────── */}
      <AnimatePresence>
        {selectedAsset && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Panel slider */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-slate-100 bg-white shadow-2xl dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedAsset.assetTag}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {/* Title */}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedAsset.name}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{selectedAsset.description || "No description provided."}</p>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                    <div className="mt-1.5">
                      <StatusBadge status={selectedAsset.status} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition</span>
                    <span className="mt-2 block text-sm font-bold text-slate-800">{selectedAsset.condition}</span>
                  </div>
                </div>

                {/* Details list */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4.5 bg-white">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Specifications</h4>
                  {[
                    { label: "Category", value: selectedAsset.categoryName, icon: <Database className="h-4 w-4 text-indigo-500" /> },
                    { label: "Department", value: selectedAsset.departmentName, icon: <Building className="h-4 w-4 text-blue-500" /> },
                    { label: "Location", value: selectedAsset.location || "Not assigned", icon: <SlidersHorizontal className="h-4 w-4 text-amber-500" /> },
                    { label: "Serial Number", value: selectedAsset.serialNumber || "None", icon: <Tag className="h-4 w-4 text-purple-500" /> },
                    { label: "Price", value: selectedAsset.price ? `$${selectedAsset.price.toLocaleString()}` : "Not declared", icon: <FileText className="h-4 w-4 text-green-500" /> },
                    { label: "Purchase Date", value: selectedAsset.purchaseDate || "None", icon: <Calendar className="h-4 w-4 text-indigo-500" /> },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-b-0">
                      <div className="flex items-center gap-2.5 text-slate-450 font-semibold">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* QR Code generator */}
                <div className="rounded-2xl border border-slate-100 p-4.5 bg-white flex flex-col items-center gap-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider self-start">Compliance Asset QR</h4>
                  <div className="flex h-36 w-36 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative group">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Asset QR Code"
                        className="h-32 w-32 object-contain"
                        onError={(e) => {
                          // If remote generator fails, show a mockup fallback QR image
                          (e.target as HTMLImageElement).src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + selectedAsset.assetTag;
                        }}
                      />
                    ) : (
                      <QrCode className="h-10 w-10 text-slate-300" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Auditors scan this barcode to run inventory verification counts.
                  </p>
                </div>

                {/* History Timeline */}
                <div className="rounded-2xl border border-slate-100 p-4.5 bg-white">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Lifecycle Log</h4>
                  {historyLoading ? (
                    <LoadingSkeleton variant="list" />
                  ) : (
                    <div className="flex flex-col gap-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      {assetHistory.map((h, i) => (
                        <div key={i} className="flex gap-4 relative">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200 text-indigo-650 font-bold z-10">
                            <History className="h-3 w-3" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">{h.action}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {h.date} · Performed by {h.performedBy}
                            </span>
                            {h.notes && (
                              <p className="text-[11px] text-slate-500 mt-1 font-medium bg-slate-50 rounded-lg p-2 border border-slate-100">
                                {h.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── CREATE ASSET MODAL DIALOG ──────────────────────────────────────── */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* Card Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl z-10 flex flex-col gap-5 dark:bg-slate-900"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-indigo-600" /> New Asset Registration
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAsset} className="flex flex-col gap-4">
                {/* Asset Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={newAsset.name}
                    onChange={(e) => setNewAsset((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dell Latitude 5420 Laptop"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    value={newAsset.description}
                    onChange={(e) => setNewAsset((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Include tag notes, storage details or hardware version..."
                    className="h-20 rounded-xl border border-slate-200 p-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50 resize-none"
                  />
                </div>

                {/* Category & Department selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Category *</label>
                    <select
                      required
                      value={newAsset.categoryId}
                      onChange={(e) => setNewAsset((prev) => ({ ...prev, categoryId: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Department *</label>
                    <select
                      required
                      value={newAsset.departmentId}
                      onChange={(e) => setNewAsset((prev) => ({ ...prev, departmentId: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Serial Number & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Serial Number</label>
                    <input
                      type="text"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset((prev) => ({ ...prev, serialNumber: e.target.value }))}
                      placeholder="e.g. SN-99831A"
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
                    <input
                      type="text"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Floor 2 Workspace"
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Condition, Purchase date and Price */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Condition</label>
                    <select
                      value={newAsset.condition}
                      onChange={(e) => setNewAsset((prev) => ({ ...prev, condition: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                    >
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Price (USD)</label>
                    <input
                      type="number"
                      value={newAsset.price}
                      onChange={(e) => setNewAsset((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 1500"
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl h-10 px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl h-10 px-6 bg-indigo-600 text-white"
                  >
                    Register Asset
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
