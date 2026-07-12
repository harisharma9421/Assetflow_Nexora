"use client";

import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import AppTopbar from "@/components/layout/AppTopbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--color-background))]">
      {/* Left Sidebar Shell (desktop only) */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <AppSidebar />
      </aside>

      {/* Main content right panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar header bar */}
        <header className="flex h-16 w-full items-center border-b border-[hsl(var(--color-border))] shrink-0 bg-white">
          <AppTopbar />
        </header>

        {/* Page content window */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
