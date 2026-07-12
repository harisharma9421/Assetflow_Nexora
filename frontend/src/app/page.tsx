"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  Wrench,
  CalendarDays,
  Building,
  GraduationCap,
  Activity,
  Factory,
  CheckCircle,
  Users,
  Database,
  Github,
  BookOpen,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

// ─── INDUSTRIES WE SERVE ─────────────────────────────────────────────────────

const industries = [
  {
    name: "Universities & Schools",
    desc: "Coordinate science lab apparatus, student Chromebooks, and staff lecture hall reservations.",
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    name: "Hospitals & Healthcare",
    desc: "Track critical ventilators, emergency beds, patient rooms, and maintenance logs.",
    icon: <Activity className="h-6 w-6" />,
  },
  {
    name: "Corporate Offices",
    desc: "Manage company laptops, monitors, meeting spaces, hot desks, and employee allocations.",
    icon: <Building className="h-6 w-6" />,
  },
  {
    name: "Manufacturing Plants",
    desc: "Track heavy machinery operations, check-out status, calibration cycles, and routine downtime.",
    icon: <Factory className="h-6 w-6" />,
  },
];

export default function LandingPage() {
  const { isAuthenticated, setAuthFromResponse } = useAuthStore();
  const router = useRouter();

  // Create Guest Demo session and redirect
  const handleOpenDemo = () => {
    const mockResponse = {
      accessToken: "mock-guest-access-token",
      tokenType: "Bearer",
      expiresInSeconds: 86400,
      user: {
        id: 9999,
        email: "demo.operator@nexora.co",
        fullName: "Demo Guest Operator",
        roleId: 1,
        roleName: "Administrator",
        departmentId: null as null,
        status: "Active" as const,
      },
    };

    setAuthFromResponse(mockResponse);
    toast.success("Guest session initialized successfully!");
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500 selection:text-white">
      {/* ─── NAVIGATION BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Nexora
            </span>
          </Link>

          {/* Clean Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="#docs" className="hover:text-primary transition-colors">Documentation</Link>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
              <Button
                variant={isAuthenticated ? "primary" : "outline"}
                className="h-10 rounded-xl px-5 text-sm font-bold"
              >
                {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent -z-10 dark:from-indigo-500/5" />
        
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-150 px-3.5 py-1 text-xs font-bold text-indigo-650 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" /> Enterprise-Grade Lifecycle & Audits
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl max-w-4xl leading-[1.15]">
              Intelligent Asset & Resource Management for Modern Organizations
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Nexora answers: <i>What assets exist, where are they located, who has them, and what is their current condition?</i> Replaces manual spreadsheets with a centralized, secure control system.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link href={ROUTES.LOGIN}>
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
                  className="rounded-xl px-7"
                >
                  Go to Login
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-7 bg-card border-border hover:bg-muted"
                >
                  Go to Signup
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={handleOpenDemo}
                className="rounded-xl px-7 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400"
              >
                Open Demo
              </Button>
              <Link href="#features">
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-xl px-5 text-muted-foreground hover:text-foreground"
                >
                  Scroll to Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOLUTIONS (INDUSTRIES) SECTION ─────────────────────────────────── */}
      <section id="solutions" className="py-20 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Tailored Configurations</span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl mt-2">
              One platform. Configured for any industry.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Nexora scales across organizations to support the distinct requirements of workspace administrators, facility leads, and equipment coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {industries.map((ind, idx) => (
              <div
                key={idx}
                className="flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400 mb-5">
                  {ind.icon}
                </div>
                <h3 className="text-base font-bold text-foreground">{ind.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SYSTEM FEATURES SECTION ────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">System Modules</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-2">
              Unified Inventory & Operations Management
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Eliminate missing items, double-booked equipment, and unscheduled maintenance downtime.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Asset Directory",
                desc: "Full visibility of physical assets with unique tags, custom category fields, and QR code tracking.",
                icon: <Package className="h-6 w-6" />,
              },
              {
                title: "Owner Allocations",
                desc: "Assign assets to employees or departments with explicit due dates. Prevents overlapping allocations.",
                icon: <Users className="h-6 w-6" />,
              },
              {
                title: "Resource Bookings",
                desc: "Reserve conference rooms, labs, or tools. Built-in overlap prevention guarantees zero double-bookings.",
                icon: <CalendarDays className="h-6 w-6" />,
              },
              {
                title: "Maintenance Pipelines",
                desc: "Track repairs with technician details, priorities, and automatic recovery back to 'Available' status.",
                icon: <Wrench className="h-6 w-6" />,
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-6 bg-card border border-border rounded-2xl shadow-sm text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/30 dark:text-indigo-400">
                  {feat.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{feat.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT US SECTION ───────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Context Text */}
            <div className="flex flex-col gap-6">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">About Nexora</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Replacing spreadsheet chaos with operational clarity.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nexora was built to help organizations regain control over their shared hardware, IT devices, room systems, and key assets. Spreadsheets fail because they lack validation, edit histories, and real-time calendars.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By enforcing hard business rules at both the API and database levels, Nexora guarantees that an asset can never be allocated to two places at once, maintenance schedules are strictly followed, and auditing reports highlight exact discrepancies.
              </p>

              <div className="flex flex-wrap gap-6 mt-2 border-t border-border pt-6">
                <div>
                  <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">100%</span>
                  <span className="text-xs font-semibold text-muted-foreground">Inventory Visibility</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">0%</span>
                  <span className="text-xs font-semibold text-muted-foreground">Overlapping Bookings</span>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">24/7</span>
                  <span className="text-xs font-semibold text-muted-foreground">Real-Time Access</span>
                </div>
              </div>
            </div>

            {/* Visual Panel */}
            <div className="bg-background rounded-3xl p-8 border border-border flex flex-col gap-6">
              <h3 className="text-base font-bold text-foreground">Nexora Guiding Principles</h3>
              <div className="flex flex-col gap-4">
                {[
                  "No double active allocations for any asset.",
                  "Completed maintenance tickets restore status to Available.",
                  "All bookings validate date range conflicts automatically.",
                  "Audit cycles produce explicit discrepancy files.",
                ].map((principle, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-muted-foreground leading-normal">{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DOCUMENTATION SECTION ─────────────────────────────────────────── */}
      <section id="docs" className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Documentation Section</span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl mt-2">
              Enterprise Integration Guide
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Implement webhook lifecycles or scan RFID compliance catalogs directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h3 className="text-base font-bold text-foreground">REST API Specifications</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect external catalogs using simple HTTP request headers and authorization bearers.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
              <Database className="h-6 w-6 text-indigo-600" />
              <h3 className="text-base font-bold text-foreground">PostgreSQL Enums Mapping</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilize custom user and asset status domains securely mapping directly to enterprise profiles.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
              <h3 className="text-base font-bold text-foreground">Audit Count Protocols</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Schedule recurring inventory count cycles producing formatted compliance log tables automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SYSTEM STATUS FOOTER & CONTACT ─────────────────────────────────── */}
      <footer className="bg-slate-900 py-16 text-slate-400 text-sm border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col gap-12">
          {/* Top layout footer columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Zap className="h-4.5 w-4.5 fill-current" />
                </div>
                <span className="font-bold text-white tracking-wide">Nexora ERP</span>
              </div>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Premium enterprise asset and facility scheduler designed to guarantee zero scheduling conflicts.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Resources</h4>
              <ul className="flex flex-col gap-2 text-xs">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#docs" className="hover:text-white transition-colors">Documentation Section</Link></li>
                <li><Link href="#solutions" className="hover:text-white transition-colors">Enterprise Solutions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">GitHub Repository</h4>
              <ul className="flex flex-col gap-2 text-xs">
                <li className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <a href="https://github.com/nexora-erp" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    GitHub Link
                  </a>
                </li>
              </ul>
            </div>

            <div id="contact">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Footer Contact</h4>
              <ul className="flex flex-col gap-2 text-xs">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium text-slate-300">support@nexora.co</span>
                </li>
                <li>
                  <span className="text-[10px] text-slate-500 leading-normal block">
                    Enterprise Technical Support Line: available 24/7.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom rights details */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-slate-800 pt-8">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Nexora Corporation. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
