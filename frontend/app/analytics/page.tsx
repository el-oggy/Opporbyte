"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, PieChart, CheckCircle2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProfileType } from "@/types";

export default function AnalyticsPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14]">
      <Sidebar activeProfile={activeProfile} onProfileChange={setActiveProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Career Analytics"
          description="Opportunity velocity, matching score distribution, and conversion metrics."
          activeProfile={activeProfile}
        />

        <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Conversion Funnel Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                Pipeline Conversion Funnel ({activeProfile})
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                PREVIEW TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Match Velocity</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">84%</p>
                <span className="text-[10px] text-emerald-500 font-semibold">High affinity</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Average ATS Score</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">92 / 100</p>
                <span className="text-[10px] text-cyan-500 font-semibold">ATS-optimized</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Response Rate</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">28.5%</p>
                <span className="text-[10px] text-indigo-500 font-semibold">Above average</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Active Interviews</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">3</p>
                <span className="text-[10px] text-emerald-500 font-semibold">In progress</span>
              </div>
            </div>
          </div>

          {/* Heuristic Score Weights Overview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              AI Matching Heuristic Weights Calibration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The 4-factor scoring model ranks opportunities according to deterministic weights.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Required Skills Intersection</span>
                  <span className="font-mono text-indigo-500">40% Weight</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[40%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Relevant Experience & Projects</span>
                  <span className="font-mono text-emerald-500">25% Weight</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[25%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Career-Role Alignment</span>
                  <span className="font-mono text-cyan-500">20% Weight</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Job Preferences Compatibility</span>
                  <span className="font-mono text-amber-500">15% Weight</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 w-[15%]" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
