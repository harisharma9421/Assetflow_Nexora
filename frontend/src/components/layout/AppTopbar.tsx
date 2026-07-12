"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Bell,
  Search,
  ChevronDown,
  CheckCircle2,
  LogOut,
  Settings,
  User,
  Command,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/shared";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { toast } from "sonner";

export default function AppTopbar() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const userName = user?.fullName || "Active Operator";
  const currentDate = format(new Date(), "EEEE, MMMM dd, yyyy");

  return (
    <div className="flex h-full w-full items-center justify-between px-6 bg-card border-b border-border select-none">
      {/* Left: Search / Workspace indicator */}
      <div className="flex items-center gap-4">
        <div className="relative hidden w-64 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workspace..."
            readOnly
            onClick={() => toast.info("Search console coming soon!")}
            className="h-9 w-full rounded-xl bg-muted pl-9 pr-10 text-xs font-semibold text-foreground outline-none border border-border transition-colors hover:border-primary/30 focus:border-primary cursor-pointer"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded bg-card border border-border px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
        <span className="hidden text-[10px] font-bold text-muted-foreground md:inline-flex items-center gap-1.5 bg-muted border border-border px-2.5 py-1 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          System Active
        </span>
      </div>

      {/* Right: Utilities */}
      <div className="flex items-center gap-4">
        {/* Date */}
        <span className="hidden text-xs font-semibold text-muted-foreground lg:inline-block">
          {currentDate}
        </span>

        {/* ─── THEME TOGGLE (Pill) ─── */}
        <ThemeToggle variant="pill" />

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-card" />
        </button>

        {/* Divider */}
        <span className="h-6 w-px bg-border" />

        {/* User profile dropdown */}
        <div className="relative">
          <div
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <UserAvatar name={userName} size="sm" />
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                {userName}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {user?.roleName || "Employee"}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>

          {/* Dropdown panel */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg z-20 flex flex-col gap-0.5 animate-in slide-in-from-top duration-150">
                {/* Header */}
                <div className="px-2.5 py-1.5 border-b border-border/60">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account</p>
                  <p className="text-xs font-bold text-foreground truncate mt-0.5">{userName}</p>
                </div>

                {/* Theme row in dropdown too */}
                <div className="px-2.5 py-2 border-b border-border/60">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Appearance</p>
                  <ThemeToggle variant="pill" className="w-full" />
                </div>

                <button
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left border-t border-border/60 mt-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
