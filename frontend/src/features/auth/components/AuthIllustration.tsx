"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PackageCheck,
  ClipboardList,
  Bell,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: PackageCheck,
    title: "Asset Lifecycle Management",
    description: "Track every asset from acquisition to disposal",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Operational dashboards with actionable insights",
  },
  {
    icon: ClipboardList,
    title: "Audit & Compliance",
    description: "Automated discrepancy detection and audit trails",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Instant alerts for allocations, maintenance, and returns",
  },
];

const stats = [
  { value: "100%", label: "Asset visibility" },
  { value: "6+", label: "Industry types" },
  { value: "4", label: "User roles" },
];

interface AuthIllustrationProps {
  variant?: "login" | "signup" | "forgot";
}

export default function AuthIllustration({ variant = "login" }: AuthIllustrationProps) {
  const titles: Record<string, string> = {
    login: "Enterprise Asset Management, Simplified",
    signup: "Join Your Organization on Assetra",
    forgot: "Secure Access. Every Time.",
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[hsl(var(--color-sidebar))] p-10 text-white">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large circle */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/[0.03]" />
        {/* Small circle */}
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/[0.03]" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Gradient accent top-right */}
        <div className="absolute -right-20 top-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-32 left-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Logo + Brand */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--color-primary))]">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-white">Assetra</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">
            Enterprise ERP
          </p>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col gap-8">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold leading-tight text-white">
            {titles[variant]}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            The intelligent platform for managing assets, resources, and
            organizational workflows — all in one place.
          </p>
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col gap-4"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                <feature.icon className="h-3.5 w-3.5 text-white/80" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{feature.title}</p>
                <p className="text-xs text-white/50">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex gap-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{stat.value}</span>
              <span className="text-xs text-white/50">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="relative z-10 flex items-center gap-2"
      >
        <Shield className="h-3.5 w-3.5 text-white/30" />
        <p className="text-xs text-white/30">
          Enterprise-grade security · Role-based access control
        </p>
      </motion.div>
    </div>
  );
}
