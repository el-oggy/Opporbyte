"use client";

import React, { useState } from "react";
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Lock,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProfileType } from "@/types";

export default function ApplicationsQueuePage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");

  const stages = [
    { name: "Draft Packages", count: 2, desc: "Assembled, awaiting review" },
    { name: "Human Review", count: 3, desc: "Candidate approval required" },
    { name: "Approved / Staged", count: 1, desc: "Ready for authorized submission" },
    { name: "Submitted", count: 5, desc: "In flight tracking" },
    { name: "Interviewing", count: 2, desc: "Active conversations" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14]">
      <Sidebar activeProfile={activeProfile} onProfileChange={setActiveProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Application Queue"
          description="Human-in-the-loop application governance with automated cross-profile deduplication."
          activeProfile={activeProfile}
        />

        <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Deduplication & Compliance Banner */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px]">
                CROSS-PROFILE DEDUPLICATION FIREWALL & HUMAN-IN-THE-LOOP CONTROL
              </span>
              <p className="mt-1 leading-relaxed">
                The database enforces a strict <code className="font-mono bg-indigo-500/20 px-1 py-0.5 rounded">UNIQUE (user_id, job_id)</code> constraint. If a job posting matches both your Semiconductor and Software profiles, Opporbyte guarantees only a single application can ever be staged or submitted. Mass unapproved submissions are strictly prohibited.
              </p>
            </div>
          </div>

          {/* Workflow Stage Pipeline */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stages.map((stage, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {stage.name}
                  </span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {stage.count}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{stage.desc}</p>
              </div>
            ))}
          </div>

          {/* Queue Staging List Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Staged Applications for {activeProfile} Track
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                STAGED QUEUE
              </span>
            </div>

            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <Send className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Application Queue Ready
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Applications staged during Phase 2 discovery and Phase 3 resume tailoring will populate here for mandatory 1-click human verification and approved submission.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
