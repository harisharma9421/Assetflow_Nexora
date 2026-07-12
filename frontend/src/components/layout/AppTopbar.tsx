"use client";

import React from "react";
import { format } from "date-fns";
import { Bell, Search, ChevronDown, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/shared";

export default function AppTopbar() {
  const { user } = useAuth();
  const userName = user?.fullName || "Active Operator";
  const currentDate = format(new Date(), "EEEE, MMMM dd, yyyy");

  return (
    <div className="flex h-full w-full items-center justify-between px-6 bg-white dark:bg-slate-900">
      {/* Search / Workspace indicator */}
      <div className="flex items-center gap-4">
        <div className="relative hidden w-64 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workspace logs..."
            className="h-9 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none border border-slate-100 transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <span className="hidden text-xs font-semibold text-slate-400 md:inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          System Active
        </span>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-5">
        {/* Date */}
        <span className="hidden text-xs font-semibold text-slate-400 lg:inline-block">
          {currentDate}
        </span>

        {/* Notifications Icon */}
        <button
          className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        {/* Vertical divider */}
        <span className="h-6 w-px bg-slate-100" />

        {/* User profile dropdown trigger */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <UserAvatar name={userName} size="sm" />
          <div className="hidden flex-col text-left sm:flex">
            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {userName}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {user?.roleName || "Employee"}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-450 group-hover:text-slate-700 transition-colors" />
        </div>
      </div>
    </div>
  );
}
