"use client";

import React, { useState } from "react";
import { Cpu, Code2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProfileEditor } from "@/components/profiles/ProfileEditor";
import { ProfileType } from "@/types";

export default function ProfilesPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14]">
      <Sidebar activeProfile={activeProfile} onProfileChange={setActiveProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Career Profiles Management"
          description="Independently configure preferences, target titles, verified skills, and matching thresholds."
          activeProfile={activeProfile}
        />

        <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Top Domain Profile Selection Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl max-w-md border border-slate-300/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setActiveProfile("semiconductor")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeProfile === "semiconductor"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md border border-amber-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Semiconductor Domain</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfile("software")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                activeProfile === "software"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md border border-indigo-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Software Domain</span>
            </button>
          </div>

          {/* Profile Editor Component */}
          <ProfileEditor profileType={activeProfile} />
        </main>
      </div>
    </div>
  );
}
