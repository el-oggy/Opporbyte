"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Cpu,
  Code2,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { JobRecommendations } from "@/components/dashboard/JobRecommendations";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ProfileType } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardOverviewPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14]">
      {/* Left Navigation Sidebar */}
      <Sidebar activeProfile={activeProfile} onProfileChange={setActiveProfile} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard Overview"
          description="Real-time monitoring of career pipelines, matched opportunities, and system health."
          activeProfile={activeProfile}
        />

        <main className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
          {/* Active Profile Status Hero Card */}
          <div
            className={`p-6 rounded-3xl border relative overflow-hidden ${
              activeProfile === "semiconductor"
                ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/25"
                : "bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/25"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3.5 rounded-2xl ${
                    activeProfile === "semiconductor"
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  }`}
                >
                  {activeProfile === "semiconductor" ? (
                    <Cpu className="w-8 h-8" />
                  ) : (
                    <Code2 className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">
                      Active Profile Scope
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                      Domain Isolated
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize mt-0.5 tracking-tight">
                    {activeProfile} Engineering Stream
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activeProfile === "semiconductor"
                      ? "Targeting VLSI, RTL Design, ASIC Verification, FPGA & Embedded Systems."
                      : "Targeting Full Stack, Backend Architecture, Distributed Systems & Modern Web."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/profiles"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition-all shadow-sm"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Configure {activeProfile} Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metrics Counters Grid */}
          <MetricsGrid activeProfile={activeProfile} />

          {/* Core Content 2-Column Section: Recommendations & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Job Recommendations Preview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    High-affinity postings evaluated by the AI Matching Engine.
                  </p>
                </div>
                <Link
                  href="/discover"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Explore Discovery Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <JobRecommendations activeProfile={activeProfile} />
            </div>

            {/* Right Column: Engine Activity & Architecture Summary */}
            <div className="space-y-6">
              <ActivityFeed />

              {/* Engine Status Callout Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Phase 1 Foundation
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Single-user authentication, PostgreSQL models, Alembic migrations, and isolated Semiconductor and Software career profiles are fully operational and persisted.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div>Backend API: FastAPI v0.1.0</div>
                  <div>Database: SQLAlchemy 2.0 + Alembic</div>
                  <div>Auth: Bcrypt + JWT + HTTP-only Cookie</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
