"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  UserCheck,
  FileText,
  Send,
  BarChart3,
  Settings,
  LogOut,
  Cpu,
  Code2,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ProfileType } from "@/types";

interface SidebarProps {
  activeProfile: ProfileType;
  onProfileChange: (type: ProfileType) => void;
}

export function Sidebar({ activeProfile, onProfileChange }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Discover Jobs", href: "/discover", icon: Compass },
    { name: "Career Profiles", href: "/profiles", icon: UserCheck },
    { name: "Resume Studio", href: "/resumes", icon: FileText },
    { name: "Application Queue", href: "/applications", icon: Send },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xl tracking-wider">
              OB
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Opporbyte
              </h1>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                One intelligent engine
              </p>
            </div>
          </div>

          {/* Quick Domain Profile Switcher */}
          <div className="mt-5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl flex items-center border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => onProfileChange("semiconductor")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeProfile === "semiconductor"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Semiconductor</span>
            </button>
            <button
              type="button"
              onClick={() => onProfileChange("software")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeProfile === "software"
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Software</span>
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Controls */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        {/* System & Security Status */}
        <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/40 rounded-lg flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">Engine v0.1.0</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private</span>
          </div>
        </div>

        {/* User Card & Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
              {user?.email || "Single-User"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Verified Single Instance
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={logout}
              aria-label="Sign Out"
              className="p-2 rounded-lg text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
