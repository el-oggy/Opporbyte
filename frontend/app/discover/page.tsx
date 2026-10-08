"use client";

import React, { useEffect, useState } from "react";
import {
  Compass,
  Building,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Plus,
  RefreshCw,
  Sparkles,
  MapPin,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Job, ProfileType } from "@/types";
import { api } from "@/lib/api";

export default function DiscoverJobsPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");

  // Ingestion Modal State
  const [showIngestionModal, setShowIngestionModal] = useState(false);
  const [provider, setProvider] = useState("greenhouse");
  const [boardToken, setBoardToken] = useState("");
  const [limit, setLimit] = useState(25);
  const [ingesting, setIngesting] = useState(false);
  const [ingestionMessage, setIngestionMessage] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs(searchQuery, selectedWorkMode);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedWorkMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleIngestBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardToken.trim()) return;
    setIngesting(true);
    setIngestionMessage(null);
    try {
      const res = await api.discoverJobs(provider, boardToken.trim(), limit);
      setIngestionMessage(res.message);
      await fetchJobs();
      setTimeout(() => {
        setShowIngestionModal(false);
        setBoardToken("");
        setIngestionMessage(null);
      }, 2500);
    } catch (err: unknown) {
      setIngestionMessage(err instanceof Error ? err.message : "Ingestion failed");
    } finally {
      setIngesting(false);
    }
  };

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
          {/* Compliance & API Architecture Banner */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block text-[11px]">
                  AUTHORIZED ATS JOB DISCOVERY ACTIVE
                </span>
                <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">
                  Ingestion uses official public board APIs (Greenhouse, Ashby, Lever). Postings are automatically deduplicated via SHA-256 canonical hashing.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIngestionModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Target Board</span>
            </button>
          </div>

          {/* Search & Modality Filter Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by role, company, or technical skill (e.g. RTL, SystemVerilog, FastAPI, React)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Work Mode Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["all", "remote", "hybrid", "on-site"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedWorkMode(mode)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize transition-all shrink-0 ${
                      selectedWorkMode === mode
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all"
              >
                Search
              </button>
            </form>

            {/* Ingestion Results Info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing <strong className="text-slate-900 dark:text-white font-mono">{jobs.length}</strong> canonical opportunities in database
              </span>
              <button
                type="button"
                onClick={() => api.seedBaselineJobs().then(fetchJobs)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-seed Baseline Engineering Jobs</span>
              </button>
            </div>
          </div>

          {/* Discovered Jobs List */}
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Querying discovered jobs from database...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <Compass className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Jobs Match Current Filter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search query or ingest opportunities from a company's Greenhouse, Ashby, or Lever board.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-500/40 dark:hover:border-indigo-500/40 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        {job.work_mode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {job.employment_type}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
                      {job.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Building className="w-3.5 h-3.5" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {job.canonical_hash.substring(0, 10)}...
                    </span>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>View Posting</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Target Board Ingestion Modal */}
          {showIngestionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Ingest Target Company ATS Board
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowIngestionModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {ingestionMessage && (
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-medium">
                    {ingestionMessage}
                  </div>
                )}

                <form onSubmit={handleIngestBoard} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      ATS Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="greenhouse">Greenhouse (boards-api.greenhouse.io)</option>
                      <option value="ashby">Ashby (api.ashbyhq.com)</option>
                      <option value="lever">Lever (api.lever.co)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Company Board Slug / Token
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. cloudflare, stripe, datadog, figma..."
                      value={boardToken}
                      onChange={(e) => setBoardToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Matches the URL slug in jobs.lever.co/token or boards.greenhouse.io/token
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowIngestionModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={ingesting}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${ingesting ? "animate-spin" : ""}`} />
                      <span>{ingesting ? "Ingesting..." : "Ingest Postings"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
