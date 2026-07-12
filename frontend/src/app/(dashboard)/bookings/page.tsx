"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Plus,
  Search,
  Clock,
  Building,
  User,
  X,
  FileCheck,
  CheckCircle,
  HelpCircle,
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

interface Booking {
  id: number;
  resourceName: string;
  resourceType: string;
  reservedBy: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: "Confirmed" | "Cancelled" | "Completed";
}

const mockBookings: Booking[] = [
  {
    id: 1,
    resourceName: "Conference Room A",
    resourceType: "Room",
    reservedBy: "Sarah Jenkins",
    startTime: "2026-07-12 14:00",
    endTime: "2026-07-12 16:00",
    purpose: "Weekly Sprint Planning Meeting",
    status: "Confirmed",
  },
  {
    id: 2,
    resourceName: "Engineering Design Lab 3",
    resourceType: "Equipment",
    reservedBy: "Robert Chen",
    startTime: "2026-07-13 09:00",
    endTime: "2026-07-13 12:00",
    purpose: "Hardware calibration testing",
    status: "Completed",
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal state
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Form state
  const [newBooking, setNewBooking] = useState({
    resourceName: "",
    resourceType: "Room",
    reservedBy: "Sarah Jenkins",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fallback or API check
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.resourceName || !newBooking.purpose) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const start = `${newBooking.date} ${newBooking.startTime}`;
    const end = `${newBooking.date} ${newBooking.endTime}`;

    const createdBooking: Booking = {
      id: Math.floor(Math.random() * 1000) + 10,
      resourceName: newBooking.resourceName,
      resourceType: newBooking.resourceType,
      reservedBy: newBooking.reservedBy,
      startTime: start,
      endTime: end,
      purpose: newBooking.purpose,
      status: "Confirmed",
    };

    // Check for overlap conflicts in local state
    const hasConflict = bookings.some(
      (b) =>
        b.resourceName.toLowerCase() === newBooking.resourceName.toLowerCase() &&
        b.status === "Confirmed" &&
        ((start >= b.startTime && start < b.endTime) ||
          (end > b.startTime && end <= b.endTime))
    );

    if (hasConflict) {
      toast.error("Conflict Alert: This resource is already reserved during this time slot.");
      return;
    }

    setBookings((prev) => [createdBooking, ...prev]);
    toast.success("Resource reservation confirmed!");
    setIsBookOpen(false);
    // Reset form
    setNewBooking({
      resourceName: "",
      resourceType: "Room",
      reservedBy: "Sarah Jenkins",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      purpose: "",
    });
  };

  const handleCancelBooking = (id: number) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
    );
    toast.info("Booking cancelled successfully.");
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      b.reservedBy.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: "resourceName", header: "Resource / Facility", className: "font-semibold text-slate-900" },
    {
      key: "resourceType",
      header: "Type",
      render: (row: Booking) => (
        <span className="inline-flex items-center rounded-lg bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-650">
          {row.resourceType}
        </span>
      ),
    },
    {
      key: "reservedBy",
      header: "Reserved By",
      render: (row: Booking) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-900">{row.reservedBy}</span>
        </div>
      ),
    },
    { key: "startTime", header: "Start Time" },
    { key: "endTime", header: "End Time" },
    {
      key: "status",
      header: "Status",
      render: (row: Booking) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (row: Booking) =>
        row.status === "Confirmed" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCancelBooking(row.id)}
            className="rounded-lg h-7 border-red-200 text-red-650 hover:bg-red-50"
          >
            Cancel
          </Button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Resource Bookings"
        breadcrumbs={[{ label: "Bookings" }]}
        actions={
          <Button
            leftIcon={<Plus className="h-4.5 w-4.5" />}
            onClick={() => setIsBookOpen(true)}
            className="rounded-xl"
          >
            New Booking
          </Button>
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Reservations</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {bookings.filter((b) => b.status === "Confirmed").length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">
            {bookings.filter((b) => b.status === "Completed").length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conflicts Handled</span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <span className="mt-3 block text-3xl font-extrabold text-slate-900">100% Conflict-Free</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reservations by resource, user or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium focus:border-indigo-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-650 bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
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
            data={filteredBookings}
            emptyTitle="No reservations found"
          />
        )}
      </div>

      {/* Booking Form Dialog */}
      <AnimatePresence>
        {isBookOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookOpen(false)}
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
                  <CalendarDays className="h-5 w-5 text-indigo-600" /> Reserve Room / Equipment
                </h3>
                <button onClick={() => setIsBookOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                {/* Resource Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Resource Name *</label>
                  <input
                    type="text"
                    required
                    value={newBooking.resourceName}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, resourceName: e.target.value }))}
                    placeholder="e.g. Conference Room A or Projector NX-2"
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50"
                  />
                </div>

                {/* Resource Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Resource Type *</label>
                  <select
                    required
                    value={newBooking.resourceType}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, resourceType: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 bg-slate-50/50 focus:outline-none"
                  >
                    <option value="Room">Conference / Project Room</option>
                    <option value="Equipment">Lab Equipment / Peripherals</option>
                  </select>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Reservation Date *</label>
                  <input
                    type="date"
                    required
                    value={newBooking.date}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, date: e.target.value }))}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none bg-slate-50/50"
                  />
                </div>

                {/* Timings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Start Time *</label>
                    <input
                      type="time"
                      required
                      value={newBooking.startTime}
                      onChange={(e) => setNewBooking((prev) => ({ ...prev, startTime: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none bg-slate-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">End Time *</label>
                    <input
                      type="time"
                      required
                      value={newBooking.endTime}
                      onChange={(e) => setNewBooking((prev) => ({ ...prev, endTime: e.target.value }))}
                      className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Purpose of Booking *</label>
                  <textarea
                    required
                    value={newBooking.purpose}
                    onChange={(e) => setNewBooking((prev) => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Briefly declare the booking intent..."
                    className="h-16 rounded-xl border border-slate-200 p-3 text-sm font-semibold focus:outline-none focus:border-indigo-600 bg-slate-50/50 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsBookOpen(false)} className="rounded-xl h-10 px-5">
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl h-10 px-6 bg-indigo-600 text-white">
                    Book Resource
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
