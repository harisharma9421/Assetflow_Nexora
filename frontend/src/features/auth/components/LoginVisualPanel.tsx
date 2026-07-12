"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Building2,
  Check,
  Laptop,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const metrics = [
  { value: "2,847", label: "Assets Tracked", icon: PackageCheck },
  { value: "18", label: "Maintenance Tasks", icon: Wrench },
  { value: "96.4%", label: "Utilization", icon: Activity },
];

const trustPoints = [
  "Real-time visibility",
  "Secure lifecycle tracking",
  "Built for every organization",
];

function MetricCard({ value, label, icon: Icon }: (typeof metrics)[number]) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-3.5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <p className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-medium leading-tight text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function AssetProfileCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-indigo-300/50 dark:border-indigo-300/20" />
      <div className="absolute left-4 top-1/2 h-px w-10 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-400/40" />
      <div className="absolute right-4 top-1/2 h-px w-10 bg-gradient-to-l from-transparent to-indigo-300 dark:to-indigo-400/40" />

      <div className="relative mx-12 rounded-[1.75rem] border border-white/90 bg-white/90 p-5 shadow-2xl shadow-indigo-200/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Laptop className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                Asset profile
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                AST-2048
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Available
          </span>
        </div>

        <div className="my-4 h-px bg-slate-100 dark:bg-white/10" />

        <div className="grid grid-cols-[1fr_auto] gap-5">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Department
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                IT Operations
              </p>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold">
                <span className="uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Asset health
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">92%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex h-[74px] w-[74px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
            <QrCode className="h-12 w-12" strokeWidth={1.4} aria-label="Asset QR code" />
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-1 top-12 flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-white text-indigo-600 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-indigo-300"
      >
        <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-1 bottom-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-white text-amber-600 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-amber-300"
      >
        <Wrench className="h-4 w-4" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

export default function LoginVisualPanel() {
  return (
    <section className="relative flex h-full min-h-screen flex-col overflow-hidden bg-slate-50 px-8 py-8 text-slate-900 dark:bg-slate-950 dark:text-white xl:px-11 xl:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-600/10" />
        <div className="absolute -bottom-20 -right-24 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl dark:bg-violet-600/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] dark:opacity-40" />
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
          <PackageCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight">AssetFlow Nexora</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
            Intelligent asset operations
          </p>
        </div>
      </div>

      <div className="relative z-10 my-auto py-7">
        <div className="mb-6 max-w-lg">
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-slate-950 dark:text-white xl:text-4xl">
            Every asset. Always accounted for.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Track ownership, condition, allocation, maintenance, and movement from one intelligent workspace.
          </p>
        </div>

        <AssetProfileCard />

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200/80 pt-5 dark:border-white/10">
        {trustPoints.map((point) => (
          <div
            key={point}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
            </span>
            {point}
          </div>
        ))}
      </div>
    </section>
  );
}
