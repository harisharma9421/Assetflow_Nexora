"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  Wrench,
  CalendarDays,
  Eye,
  MessageSquare,
  Building,
  GraduationCap,
  Activity,
  Factory,
  CheckCircle,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

// ─── RELEVANT BLOGS DATA FOR NEXORA ERP ────────────────────────────────────────

const blogPosts = [
  {
    id: 1,
    category: "Best Practices",
    readTime: "3 min Read",
    title: "How to run automated physical audits in high-density corporate environments",
    views: 1240,
    comments: 5,
    date: "Jul 12, 2026",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&fit=crop&q=80", // Corporate office building
  },
  {
    id: 2,
    category: "Healthcare",
    readTime: "4 min Read",
    title: "Optimizing medical device lifecycles to reduce clinical equipment downtime",
    views: 980,
    comments: 2,
    date: "Jul 08, 2026",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&fit=crop&q=80", // Laboratory/medical equipment
  },
  {
    id: 3,
    category: "Higher Education",
    readTime: "3 min Read",
    title: "Preventing classroom booking conflicts: A blueprint for modern universities",
    views: 1450,
    comments: 12,
    date: "Jun 28, 2026",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&fit=crop&q=80", // University campus
  },
];

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
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* ─── NAVIGATION BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Nexora
            </span>
          </div>

          {/* Clean Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500 hover:text-slate-800">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</Link>
            <Link href="#about" className="hover:text-indigo-600 transition-colors">About Us</Link>
            <Link href="#blog" className="hover:text-indigo-600 transition-colors">Resources</Link>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}>
              <Button
                variant={isAuthenticated ? "primary" : "outline"}
                className="h-10 rounded-xl px-5 text-sm font-bold"
              >
                {isAuthenticated ? "Go to Dashboard" : "Log In"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/70 via-transparent to-transparent -z-10" />
        
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1 text-xs font-bold text-indigo-600">
              <ShieldCheck className="h-4 w-4" /> Enterprise-Grade Lifecycle & Audits
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl leading-[1.15]">
              Intelligent Asset & Resource Management for Modern Organizations
            </h1>
            <p className="max-w-2xl text-base text-slate-500 sm:text-lg">
              Nexora answers: <i>What assets exist, where are they located, who has them, and what is their current condition?</i> Replaces manual spreadsheets with a centralized, secure control system.
            </p>

            <div className="flex items-center gap-3.5 mt-2">
              <Link href={ROUTES.LOGIN}>
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
                  className="rounded-xl px-7"
                >
                  Access Console
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-7 bg-white hover:bg-slate-50"
                >
                  Register Organization
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOLUTIONS (INDUSTRIES) SECTION ─────────────────────────────────── */}
      <section id="solutions" className="py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Tailored Configurations</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mt-2">
              One platform. Configured for any industry.
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Nexora scales across organizations to support the distinct requirements of workspace administrators, facility leads, and equipment coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {industries.map((ind, idx) => (
              <div
                key={idx}
                className="flex flex-col p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-5">
                  {ind.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{ind.name}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SYSTEM FEATURES SECTION ────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">System Modules</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
              Unified Inventory & Operations Management
            </h2>
            <p className="mt-3 text-sm text-slate-500">
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
                className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {feat.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT US SECTION ───────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Context Text */}
            <div className="flex flex-col gap-6">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">About Nexora</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Replacing spreadsheet chaos with operational clarity.
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Nexora was built to help organizations regain control over their shared hardware, IT devices, room systems, and key assets. Spreadsheets fail because they lack validation, edit histories, and real-time calendars.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                By enforcing hard business rules at both the API and database levels, Nexora guarantees that an asset can never be allocated to two places at once, maintenance schedules are strictly followed, and auditing reports highlight exact discrepancies.
              </p>

              <div className="flex flex-wrap gap-6 mt-2 border-t border-slate-100 pt-6">
                <div>
                  <span className="block text-2xl font-bold text-indigo-600">100%</span>
                  <span className="text-xs font-semibold text-slate-400">Inventory Visibility</span>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div>
                  <span className="block text-2xl font-bold text-indigo-600">0%</span>
                  <span className="text-xs font-semibold text-slate-400">Overlapping Bookings</span>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div>
                  <span className="block text-2xl font-bold text-indigo-600">24/7</span>
                  <span className="text-xs font-semibold text-slate-400">Real-Time Access</span>
                </div>
              </div>
            </div>

            {/* Visual Panel */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col gap-6">
              <h3 className="text-base font-bold text-slate-900">Nexora Guiding Principles</h3>
              <div className="flex flex-col gap-4">
                {[
                  "No double active allocations for any asset.",
                  "Completed maintenance tickets restore status to Available.",
                  "All bookings validate date range conflicts automatically.",
                  "Audit cycles produce explicit discrepancy files.",
                ].map((principle, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-650 leading-normal">{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RESOURCES/BLOG SECTION ─────────────────────────────────────────── */}
      <section id="blog" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Knowledge Center</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl mt-2">
              Asset Operations & Compliance Insights
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Read the latest articles from our operations leads on auditing workflows, hardware lifecycle optimizations, and facility management.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-150 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Post Cover image */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-4 top-4 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                    {post.readTime}
                  </span>
                </div>

                {/* Info Container */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Category chip */}
                  <span className="inline-flex self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h3 className="mt-4 text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    <Link href="#">{post.title}</Link>
                  </h3>

                  {/* Metadata & Author Footer */}
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.avatar}
                        alt="Author"
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-slate-500 font-medium">
                        {post.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" /> {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SYSTEM STATUS FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-12 text-slate-400 text-sm border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Zap className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="font-bold text-white tracking-wide">Nexora ERP</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Nexora Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
