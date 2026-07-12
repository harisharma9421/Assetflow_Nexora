"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

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
    <div className="relative flex h-full flex-col justify-between bg-slate-50 p-12 overflow-hidden dark:bg-slate-950">
      {/* Decorative Blur Background blobs */}
      <div className="absolute -left-12 -top-12 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-950/20" />
      <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-950/20" />

      {/* Brand Header */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--color-primary))] text-white shadow-md shadow-indigo-600/20">
          <Zap className="h-5.5 w-5.5 fill-current text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Nexora
          </span>
          <span className="ml-1.5 inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--color-primary))] dark:bg-indigo-950/30">
            ERP
          </span>
        </div>
      </div>

      {/* Center Vector Scene Illustration */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative flex h-64 w-full max-w-sm items-center justify-center rounded-[20px] bg-white/60 p-6 shadow-xl shadow-slate-100/40 backdrop-blur-md dark:bg-slate-900/40 dark:shadow-none"
        >
          {/* Custom Modern Vector Scene Representation using SVGs */}
          <svg
            className="h-full w-full"
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft grid background */}
            <circle cx="150" cy="100" r="80" fill="#EEF2F6" className="dark:fill-slate-800/30" />
            <path
              d="M100 100H200M150 50V150"
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="dark:stroke-slate-800"
            />

            {/* Character Base */}
            <g id="character">
              {/* Body & Shirt */}
              <path
                d="M150 145 C135 145 125 155 125 170 H175 C175 155 165 145 150 145 Z"
                fill="#3B82F6"
              />
              {/* Head */}
              <circle cx="150" cy="120" r="14" fill="#FBCFE8" />
              {/* Hair */}
              <path
                d="M136 120 C136 108 144 104 150 104 C156 104 164 108 164 120 C164 116 160 110 150 110 C140 110 136 116 136 120 Z"
                fill="#1E293B"
              />
              {/* Arms */}
              <path
                d="M125 150 Q110 140 98 132"
                stroke="#3B82F6"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M175 150 Q190 140 202 132"
                stroke="#3B82F6"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </g>

            {/* Shield Check Illustration */}
            <g id="shield" className="animate-bounce" style={{ animationDuration: "3s" }}>
              <path
                d="M210 105 C210 85 228 80 228 80 C228 80 246 85 246 105 C246 128 228 140 228 140 C228 140 210 128 210 105 Z"
                fill="#10B981"
              />
              <path
                d="M220 110 L225 115 L236 102"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Floating UI panel representation */}
            <g id="ui-panel" className="animate-pulse">
              <rect
                x="45"
                y="55"
                width="75"
                height="55"
                rx="8"
                fill="white"
                stroke="#E2E8F0"
                strokeWidth="1.5"
                className="dark:fill-slate-900 dark:stroke-slate-800"
              />
              <circle cx="58" cy="67" r="5" fill="#F87171" />
              <rect
                x="70"
                y="63"
                width="38"
                height="3.5"
                rx="1.5"
                fill="#94A3B8"
                className="dark:fill-slate-700"
              />
              <rect
                x="55"
                y="78"
                width="55"
                height="2.5"
                rx="1.2"
                fill="#CBD5E1"
                className="dark:fill-slate-700"
              />
              <rect
                x="55"
                y="85"
                width="40"
                height="2.5"
                rx="1.2"
                fill="#CBD5E1"
                className="dark:fill-slate-700"
              />
              <rect
                x="55"
                y="92"
                width="50"
                height="2.5"
                rx="1.2"
                fill="#3B82F6"
              />
            </g>

            {/* Small floating assets icon representation */}
            <g id="floater" className="animate-bounce" style={{ animationDuration: "4s" }}>
              <circle cx="75" cy="140" r="16" fill="#F59E0B" fillOpacity="0.2" />
              <path
                d="M75 132 L82 136 L75 140 L68 136 Z M68 138 L75 142 L82 138 M68 141 L75 145 L82 141"
                stroke="#D97706"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </motion.div>

        {/* Text descriptions */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            {titles[variant]}
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
            Replacing outdated registry registers with a singular, workflow-driven enterprise platform.
          </p>
        </div>
      </div>

      {/* Footer text */}
      <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>© {currentYear} Nexora Corp</span>
        <span>Enterprise Analytics v1.0</span>
      </div>
    </div>
  );
}
