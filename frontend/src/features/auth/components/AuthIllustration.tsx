"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Database, Calendar } from "lucide-react";

interface AuthIllustrationProps {
  variant?: "login" | "signup" | "forgot";
}

export default function AuthIllustration({ variant = "login" }: AuthIllustrationProps) {
  const titles = {
    login: "Manage physical assets throughout their lifecycle.",
    signup: "Connect your team to centralized resource registers.",
    forgot: "Secure password retrieval protocols.",
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="relative flex h-full flex-col justify-between bg-slate-950 p-12 overflow-hidden text-white">
      {/* Decorative Blur Background blobs (SaaS style) */}
      <div className="absolute -left-12 -top-12 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      
      {/* Structural Dot Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />

      {/* Brand Header */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
          <Zap className="h-5.5 w-5.5 fill-current text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white">
            Nexora
          </span>
          <span className="ml-1.5 inline-flex items-center rounded-full bg-indigo-950/50 border border-indigo-900/50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
            ERP
          </span>
        </div>
      </div>

      {/* Center Abstract Dashboard/Asset Graphics (Linear/Stripe style) */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-sm flex flex-col gap-4"
        >
          {/* Card 1: Asset Details Widget */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dell Latitude 5420</h4>
                  <p className="text-[10px] text-slate-400">Tag: NX-4480 · HW-109</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-950/50 border border-green-900/50 px-2 py-0.5 text-[10px] font-bold text-green-400">
                Active
              </span>
            </div>
            <div className="mt-4 border-t border-white/5 pt-3.5 flex items-center justify-between text-xs text-slate-400">
              <span>Holder: Sarah Jenkins</span>
              <span>Due: July 20, 2026</span>
            </div>
          </div>

          {/* Card 2: Calendar Reservation Conflict Check Widget */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 shadow-2xl backdrop-blur-md ml-6 mr-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Conference Room A</h4>
                  <p className="text-[10px] text-slate-400">14:00 - 16:00 · Booking Req</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-950/50 border border-indigo-900/50 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                Verified
              </span>
            </div>
          </div>

          {/* Card 3: Compliance Stock Count Widget */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 shadow-2xl backdrop-blur-md mr-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Audit Verification</h4>
                  <p className="text-[10px] text-slate-400">Discrepancy Status: 0 Mismatch</p>
                </div>
              </div>
              <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Text descriptions */}
        <div className="mt-12 text-center">
          <h2 className="text-lg font-bold tracking-tight text-white">
            {titles[variant]}
          </h2>
          <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Centralized control system for physical inventories, workspace allocations, and compliance logs.
          </p>
        </div>
      </div>

      {/* Footer text */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <span>© {currentYear} Nexora Corp</span>
        <span>Enterprise Operations Console</span>
      </div>
    </div>
  );
}
