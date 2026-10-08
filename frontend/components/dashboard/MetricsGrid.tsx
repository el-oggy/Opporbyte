"use client";

import React from "react";
import { Search, Sparkles, FileCheck, Send } from "lucide-react";
import { ProfileType } from "@/types";

interface MetricsGridProps {
  activeProfile: ProfileType;
}

export function MetricsGrid({ activeProfile }: MetricsGridProps) {
  // Profile-specific contextual demonstration counters
  const metrics =
    activeProfile === "semiconductor"
      ? [
          {
            title: "Discovered Jobs",
            value: "28",
            sub: "Permitted sources (Greenhouse/Ashby)",
            change: "+12 this week",
            icon: Search,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
          },
          {
            title: "Strong Matches (≥80%)",
            value: "9",
            sub: "VLSI, RTL & Verification focus",
            change: "Ready for review",
            icon: Sparkles,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
          },
          {
            title: "Prepared Applications",
            value: "4",
            sub: "Awaiting candidate approval",
            change: "ATS resumes tailored",
            icon: FileCheck,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
          },
          {
            title: "Submitted Applications",
            value: "7",
            sub: "Tracked across active pipelines",
            change: "2 in interview stage",
            icon: Send,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
          },
        ]
      : [
          {
            title: "Discovered Jobs",
            value: "45",
            sub: "Permitted sources (Greenhouse/Ashby)",
            change: "+19 this week",
            icon: Search,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
          },
          {
            title: "Strong Matches (≥80%)",
            value: "14",
            sub: "Full Stack, Backend & Systems focus",
            change: "Ready for review",
            icon: Sparkles,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
          },
          {
            title: "Prepared Applications",
            value: "6",
            sub: "Awaiting candidate approval",
            change: "ATS resumes tailored",
            icon: FileCheck,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
          },
          {
            title: "Submitted Applications",
            value: "11",
            sub: "Tracked across active pipelines",
            change: "3 in interview stage",
            icon: Send,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
          },
        ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {m.title}
              </span>
              <div className={`p-2 rounded-xl ${m.bg} ${m.color} border ${m.border}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {m.value}
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {m.change}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
              <span>{m.sub}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                Preview Metric
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
