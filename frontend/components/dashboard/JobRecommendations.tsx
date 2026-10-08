"use client";

import React from "react";
import {
  Sparkles,
  Building2,
  MapPin,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { ProfileType } from "@/types";

interface JobRecommendationsProps {
  activeProfile: ProfileType;
}

export function JobRecommendations({ activeProfile }: JobRecommendationsProps) {
  const semiconductorDemos = [
    {
      id: "demo-semi-1",
      title: "Lead RTL Design & Microarchitecture Engineer",
      company: "Advanced Micro Devices (AMD)",
      location: "Austin, TX (Hybrid)",
      work_mode: "Hybrid",
      score: 94,
      classification: "Strong Match",
      matched_skills: ["SystemVerilog", "RTL Design", "UVM", "Synthesis"],
      missing_skills: ["Chisel"],
      source: "Greenhouse API",
      posted_at: "2 hours ago",
      breakdown: { skills: 96, exp: 92, align: 95, pref: 90 },
    },
    {
      id: "demo-semi-2",
      title: "Senior ASIC Verification Engineer (PCIe / CXL)",
      company: "NVIDIA",
      location: "Santa Clara, CA (On-site)",
      work_mode: "On-site",
      score: 88,
      classification: "Strong Match",
      matched_skills: ["SystemVerilog", "Design Verification", "ASIC", "Verilator"],
      missing_skills: ["Formal Verification"],
      source: "Ashby API",
      posted_at: "5 hours ago",
      breakdown: { skills: 90, exp: 88, align: 85, pref: 85 },
    },
    {
      id: "demo-semi-3",
      title: "FPGA Systems Emulation & Prototyping Engineer",
      company: "Qualcomm",
      location: "San Diego, CA (Hybrid)",
      work_mode: "Hybrid",
      score: 82,
      classification: "Strong Match",
      matched_skills: ["FPGA", "Embedded Systems", "Digital Design"],
      missing_skills: ["Xilinx Vivado HLS"],
      source: "Lever API",
      posted_at: "1 day ago",
      breakdown: { skills: 85, exp: 80, align: 82, pref: 80 },
    },
  ];

  const softwareDemos = [
    {
      id: "demo-soft-1",
      title: "Staff Distributed Backend Systems Engineer",
      company: "Stripe",
      location: "San Francisco, CA (Remote)",
      work_mode: "Remote",
      score: 96,
      classification: "Strong Match",
      matched_skills: ["Python", "FastAPI", "PostgreSQL", "Distributed Systems"],
      missing_skills: ["Ruby"],
      source: "Greenhouse API",
      posted_at: "1 hour ago",
      breakdown: { skills: 98, exp: 95, align: 96, pref: 94 },
    },
    {
      id: "demo-soft-2",
      title: "Senior Full Stack Platform Engineer",
      company: "Datadog",
      location: "New York, NY (Hybrid)",
      work_mode: "Hybrid",
      score: 89,
      classification: "Strong Match",
      matched_skills: ["Next.js", "TypeScript", "React", "API Design"],
      missing_skills: ["Go"],
      source: "Ashby API",
      posted_at: "4 hours ago",
      breakdown: { skills: 92, exp: 86, align: 90, pref: 85 },
    },
    {
      id: "demo-soft-3",
      title: "Infrastructure & High-Throughput API Engineer",
      company: "Cloudflare",
      location: "Austin, TX (Remote)",
      work_mode: "Remote",
      score: 84,
      classification: "Strong Match",
      matched_skills: ["Software Engineering", "Backend Development", "Docker"],
      missing_skills: ["Rust"],
      source: "Lever API",
      posted_at: "1 day ago",
      breakdown: { skills: 88, exp: 82, align: 84, pref: 80 },
    },
  ];

  const jobs = activeProfile === "semiconductor" ? semiconductorDemos : softwareDemos;

  return (
    <div className="space-y-4">
      {/* Explicit Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-[11px] block">
            DEMO PREVIEW DATA — PHASE 2 INTEGRATION STAGING
          </span>
          <p className="mt-0.5 leading-relaxed">
            The items below are demonstration schemas illustrating the 4-factor scoring heuristic (40% skills, 25% experience, 20% role alignment, 15% preferences). Live background ingestion from Greenhouse, Ashby, and Lever APIs will activate in Phase 2.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-500/40 dark:hover:border-indigo-500/40"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {job.source}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    • {job.posted_at}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>

              {/* Match Score Gauge */}
              <div className="flex items-center gap-4 self-start md:self-auto shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-2xl font-black text-emerald-500">
                      {job.score}%
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    {job.classification}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Factor Heuristic Breakdown Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400">Matched Skills:</span>
                {job.matched_skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                <span title="Required Skills (40% weight)">Skills: {job.breakdown.skills}%</span>
                <span title="Experience & Projects (25% weight)">Exp: {job.breakdown.exp}%</span>
                <span title="Role Alignment (20% weight)">Align: {job.breakdown.align}%</span>
                <span title="Preferences (15% weight)">Pref: {job.breakdown.pref}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
