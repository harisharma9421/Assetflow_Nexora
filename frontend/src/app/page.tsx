"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Wrench,
  CalendarDays,
  History,
  Eye,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

// ─── MOCK BLOGS DATA FOR REDESIGNED LANDING PAGE ──────────────────────────────

const blogPosts = [
  {
    id: 1,
    category: "Gadget",
    readTime: "2 min Read",
    title: "As yen tumbles, gadget-loving Japan goes for secondhand iPhones",
    views: 4301,
    comments: 3,
    date: "Fri, Jul 10",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&fit=crop&q=80",
  },
  {
    id: 2,
    category: "Social",
    readTime: "2 min Read",
    title: "Intel loses bid to revive antitrust case against patent foe Fortress",
    views: 1767,
    comments: 3,
    date: "Thu, Jul 9",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&fit=crop&q=80",
  },
  {
    id: 3,
    category: "Lifestyle",
    readTime: "2 min Read",
    title: "Streaming video way before it was cool, go dark tomorrow",
    views: 2054,
    comments: 8,
    date: "Wed, Jul 8",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&fit=crop&q=80",
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

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500 hover:text-slate-800">
            <Link href="#" className="hover:text-indigo-600 transition-colors">About Us</Link>
            <Link href="#" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Blog</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Portfolio <span className="ml-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">New</span></Link>
            <Link href={ROUTES.DASHBOARD} className="hover:text-indigo-600 transition-colors">Dashboard</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Contact</Link>
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
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/70 via-transparent to-transparent -z-10" />
        
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1 text-xs font-bold text-indigo-600">
              <ShieldCheck className="h-4 w-4" /> Trusted Resource Audits & Lifecycle
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-3xl leading-[1.15]">
              Intelligent Enterprise Asset & Resource Management
            </h1>
            <p className="max-w-2xl text-base text-slate-500 sm:text-lg">
              Nexora is a centralized SaaS platform replacing spreadsheets and manual registers with real-time operational visibility, maintenance pipelines, and audit controls.
            </p>

            <div className="flex items-center gap-3.5 mt-2">
              <Link href={ROUTES.LOGIN}>
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="h-4.5 w-4.5" />}
                  className="rounded-xl px-7"
                >
                  Explore Dashboard
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-7 bg-white hover:bg-slate-50"
                >
                  Register Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BLOG ARTICLES SECTION (AS SEEN IN SCREENSHOT) ───────────────────── */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Our Publication</span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
              Latest Insights & System Updates
            </h2>
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
                className="group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Post Cover image */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-50">
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
                      <span className="text-xs font-semibold text-slate-500">
                        {post.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
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

      {/* ─── SYSTEM FEATURES SECTION ────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center gap-2 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Robust Architecture</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Core Modules Designed for Scale
            </h2>
            <p className="max-w-xl text-sm text-slate-500">
              Nexora provides complete compliance tracking and resource availability logs out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Asset Visibility", desc: "Scan, search, and audit physical inventories directly via tags & serials.", icon: <Package className="h-6 w-6" /> },
              { title: "Lifecycle Logs", desc: "Track every state transition from checking out to repair pipelines.", icon: <History className="h-6 w-6" /> },
              { title: "Maintenance Checks", desc: "Assign technicians, approve repairs, and restore assets cleanly.", icon: <Wrench className="h-6 w-6" /> },
              { title: "Resource Bookings", desc: "Conflict-free reservations on conference rooms and shared devices.", icon: <CalendarDays className="h-6 w-6" /> },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {feat.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{feat.desc}</p>
              </div>
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
            <span className="font-bold text-white">Nexora ERP</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Nexora Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
