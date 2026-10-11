"use client";

import React, { useEffect, useState } from "react";
import { Cpu, Code2, Database, CheckCircle2 } from "lucide-react";
import { ProfileType } from "@/types";
import { api } from "@/lib/api";

interface HeaderProps {
  title: string;
  description?: string;
  activeProfile: ProfileType;
}

export function Header({ title, description, activeProfile }: HeaderProps) {
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .healthCheck()
      .then((res) => setDbHealthy(res.database_connected))
      .catch(() => setDbHealthy(false));
  }, []);

  return (
    <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-8 py-5 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Active Profile Indicator Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            activeProfile === "semiconductor"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
          }`}
        >
          {activeProfile === "semiconductor" ? (
            <Cpu className="w-3.5 h-3.5" />
          ) : (
            <Code2 className="w-3.5 h-3.5" />
          )}
          <span className="capitalize">{activeProfile} Profile Active</span>
        </div>

        {/* Database Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>DB:</span>
          {dbHealthy === true ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
          ) : dbHealthy === false ? (
            <span className="text-rose-500 font-semibold">Degraded</span>
          ) : (
            <span className="text-slate-400">Connecting...</span>
          )}
        </div>
      </div>
    </header>
  );
}
