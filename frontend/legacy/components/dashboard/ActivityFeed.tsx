"use client";

import React from "react";
import { Clock, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";

export function ActivityFeed() {
  const events = [
    {
      id: "ev-1",
      title: "Career Profile Synced",
      desc: "Semiconductor and Software profiles verified in database.",
      time: "Just now",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "ev-2",
      title: "Single-User Auth Session Initialized",
      desc: "Authenticated via secure HTTP-only cookie and bearer token.",
      time: "5 minutes ago",
      icon: ShieldCheck,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      id: "ev-3",
      title: "Alembic Migrations Applied",
      desc: "10 core foundation models provisioned with unique application constraints.",
      time: "15 minutes ago",
      icon: RefreshCw,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Engine Activity
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          SYSTEM AUDIT STREAM
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {events.map((ev) => {
          const Icon = ev.icon;
          return (
            <div key={ev.id} className="flex items-start gap-3 text-xs">
              <div className={`p-1.5 rounded-lg ${ev.bg} ${ev.color} mt-0.5 shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                    {ev.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{ev.time}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  {ev.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
