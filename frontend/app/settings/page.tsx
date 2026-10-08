"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  Database,
  Moon,
  Sun,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  Server,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ProfileType } from "@/types";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [health, setHealth] = useState<{ status: string; database_connected: boolean } | null>(null);

  useEffect(() => {
    api.healthCheck().then(setHealth).catch(() => setHealth({ status: "offline", database_connected: false }));
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14]">
      <Sidebar activeProfile={activeProfile} onProfileChange={setActiveProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="System Settings & Security"
          description="Single-user credentials, database connectivity, theme, and backend diagnostics."
          activeProfile={activeProfile}
        />

        <main className="p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security & Authentication Configuration */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Single-User Security & Session
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Opporbyte operates with strict single-user authentication. Credentials are not stored in source code and are managed via environment variables.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Authenticated Identifier:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {user?.email || "engineer@opporbyte.internal"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Session Cookie Security:</span>
                  <span className="font-mono text-emerald-500 font-semibold">
                    HTTP-Only, SameSite=Lax
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Token Algorithm:</span>
                  <span className="font-mono text-indigo-500 font-semibold">HS256 (JWT)</span>
                </div>
              </div>
            </div>

            {/* Backend & Database Health Diagnostics */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Engine & Database Diagnostics
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time operational status of the FastAPI backend and persistent storage layer.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Backend API Status:</span>
                  <span className="font-mono font-semibold text-emerald-500 capitalize flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {health?.status || "Live"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Database Connection:</span>
                  <span className="font-mono font-semibold text-emerald-500">
                    {health?.database_connected ? "Connected (SQLAlchemy 2.0)" : "Pending"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Interactive Swagger Docs:</span>
                  <a
                    href="http://localhost:8000/api/v1/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>/api/v1/docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Appearance & Interface */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {theme === "dark" ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-slate-400" />}
                Theme & Appearance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Toggle between light and dark high-contrast themes.
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Active Theme:</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold capitalize flex items-center gap-2 shadow-sm"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
                </button>
              </div>
            </div>

            {/* Environment Variable Setup Guide */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400" />
                Environment File Reference
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                To update single-user credentials or point to remote PostgreSQL in production:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-1">
                <div>FIRST_USER_EMAIL=engineer@opporbyte.internal</div>
                <div>FIRST_USER_PASSWORD=YourSecurePassphrase!</div>
                <div>DATABASE_URL=postgresql+psycopg://...</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
