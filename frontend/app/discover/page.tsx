"use client";

import React, { useState } from "react";
import {
  Compass,
  Building,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProfileType } from "@/types";

export default function DiscoverJobsPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");
  const [searchQuery, setSearchQuery] = useState("");

  const sources = [
    {
      name: "Greenhouse Boards API",
      status: "Configured (Phase 2)",
      method: "Official Public Endpoints",
      rateLimit: "30 req/min",
      active: true,
    },
    {
      name: "Ashby Postings API",
      status: "Configured (Phase 2)",
      method: "Official REST API",
      rateLimit: "60 req/min",
      active: true,
    },
    {
      name: "Lever Postings API",
      status: "Configured (Phase 2)",
      method: "Official Public API",
      rateLimit: "30 req/min",
      active: true,
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14]">
      <Sidebar activeProfile={activeProfile} onProfileChange={setActiveProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Discover Jobs"
          description="Automated job ingestion from permitted corporate boards and structured ATS platforms."
          activeProfile={activeProfile}
        />

        <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Phase 2 Architecture Notice */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px]">
                PHASE 2 ENGINE ROADMAP & INTEGRATION SPECIFICATION
              </span>
              <p className="mt-1 leading-relaxed">
                Job discovery operates exclusively through official ATS APIs (Greenhouse, Ashby, Lever). Opporbyte does not perform unauthorized scraping, bypass CAPTCHAs, or evade platform boundaries. Typed discovery provider interfaces are defined in <code className="font-mono bg-indigo-500/20 px-1 py-0.5 rounded">backend/app/services/interfaces/job_discovery.py</code>.
              </p>
            </div>
          </div>

          {/* Permitted Sources Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sources.map((src, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {src.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Authorized
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Method: {src.method}
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Rate quota: {src.rateLimit}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Ingestion Filter Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search discovered postings for ${activeProfile} profile...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <Compass className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Discovery Ingestion Queue Ready
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                During Phase 2, this screen will index live postings against the database <code className="font-mono text-indigo-500">jobs</code> table and enforce deduplication via cryptographic title-company hashing.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
