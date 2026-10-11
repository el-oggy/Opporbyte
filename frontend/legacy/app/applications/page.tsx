"use client";

import React, { useEffect, useState } from "react";
import {
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Lock,
  Plus,
  FileText,
  ExternalLink,
  ChevronRight,
  X,
  Trash2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  Application,
  ApplicationMetrics,
  ApplicationStatus,
  Job,
  ProfileType,
  ResumeVersion,
} from "@/types";
import { api } from "@/lib/api";

export default function ApplicationsQueuePage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");
  const [applications, setApplications] = useState<Application[]>([]);
  const [metrics, setMetrics] = useState<ApplicationMetrics | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // Stage Application Modal
  const [showStageModal, setShowStageModal] = useState<boolean>(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [stageJobId, setStageJobId] = useState<string>("");
  const [stageResumeId, setStageResumeId] = useState<string>("");
  const [stageNotes, setStageNotes] = useState<string>("");
  const [stagingLoading, setStagingLoading] = useState<boolean>(false);

  // Notification
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 6000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, met, allJobs, allResumes] = await Promise.all([
        api.getApplications(
          activeProfile,
          statusFilter === "all" ? undefined : statusFilter
        ),
        api.getApplicationMetrics(),
        api.getJobs(),
        api.getResumes(activeProfile),
      ]);
      setApplications(apps);
      setMetrics(met);
      setJobs(allJobs);
      setResumes(allResumes);
      if (allJobs.length > 0 && !stageJobId) setStageJobId(allJobs[0].id);
      if (allResumes.length > 0 && !stageResumeId) setStageResumeId(allResumes[0].id);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProfile, statusFilter]);

  const handleStageApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageJobId) return;

    setStagingLoading(true);
    try {
      await api.stageApplication(
        activeProfile,
        stageJobId,
        stageResumeId || undefined,
        stageNotes || undefined
      );
      showNotice("success", "Application package staged in Human Review Queue!");
      setShowStageModal(false);
      setStageNotes("");
      await loadData();
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to stage application");
    } finally {
      setStagingLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await api.updateApplication(appId, { status: newStatus });
      showNotice("success", `Application status updated to ${newStatus.replace(/_/g, " ").toUpperCase()}`);
      await loadData();
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to update application status");
    }
  };

  const handleDelete = async (appId: string) => {
    try {
      await api.deleteApplication(appId);
      showNotice("success", "Application removed from tracking queue.");
      await loadData();
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to remove application");
    }
  };

  const stages = [
    { name: "Ready for Review", count: metrics?.ready_for_review ?? 0, filter: "ready_for_review" },
    { name: "Approved Packages", count: metrics?.approved ?? 0, filter: "approved" },
    { name: "Submitted In-Flight", count: metrics?.submitted ?? 0, filter: "submitted" },
    { name: "Interviewing", count: metrics?.interviewing ?? 0, filter: "interviewing" },
    { name: "Total Tracked", count: metrics?.total ?? 0, filter: "all" },
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
          {/* Notification Alert */}
          {notification && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between transition-all ${
                notification.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                )}
                <span>{notification.text}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cross-Profile Deduplication & Governance Banner */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {stages.map((stage, idx) => {
              const isActive = statusFilter === stage.filter;
              return (
                <div
                  key={idx}
                  onClick={() => setStatusFilter(stage.filter)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    isActive
                      ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500"
                      : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {stage.name}
                    </span>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                      {stage.count}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {isActive ? "Active Filter" : "Click to view"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Queue Staging Header and Actions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Application Packages for {activeProfile.toUpperCase()} Track
                </h3>
                <p className="text-xs text-slate-400">
                  Every package requires explicit human approval prior to submission.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowStageModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Stage New Application</span>
              </button>
            </div>

            {/* Applications List */}
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading application packages...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <Send className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No Applications Staged in this View
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  When you discover a target job and tailor an ATS resume, stage the package here for 1-click human verification and tracking.
                </p>
                <button
                  type="button"
                  onClick={() => setShowStageModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Stage First Application</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const isReady = app.status === "ready_for_review";
                  const isApproved = app.status === "approved";
                  const isSubmitted = app.status === "submitted";

                  return (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {app.job_title || "Target Role"}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                              {app.profile_type || activeProfile}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {app.job_company || "Company"}
                            </span>
                            <span>&bull;</span>
                            <span>{app.job_location || "Location"}</span>
                            <span>&bull;</span>
                            <span className="capitalize">{app.job_source || "Board"}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-mono ${
                              isReady
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : isApproved
                                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                : isSubmitted
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}
                          >
                            {app.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Package Meta: Resume and Notes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Attached ATS Resume
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {app.resume_name || "Tailored ATS Resume"}
                            </span>
                            {app.ats_score && (
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                                {app.ats_score}% ATS
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Submission Strategy / Notes
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 text-xs truncate">
                            {app.notes || "Standard verified application submission."}
                          </p>
                        </div>
                      </div>

                      {/* Governance Actions Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                        <span className="text-[11px] text-slate-400">
                          {isSubmitted && app.submitted_at
                            ? `Submitted on ${new Date(app.submitted_at).toLocaleDateString()}`
                            : `Staged ${new Date(app.created_at).toLocaleDateString()}`}
                        </span>

                        <div className="flex items-center gap-2">
                          {isReady && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, "approved")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Package</span>
                            </button>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(app.id, "submitted")}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Mark as Submitted</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STAGE APPLICATION MODAL */}
          {showStageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Stage Application Package ({activeProfile})
                    </h3>
                  </div>
                  <button onClick={() => setShowStageModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleStageApplication} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target Canonical Job
                    </label>
                    <select
                      value={stageJobId}
                      onChange={(e) => setStageJobId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.company} - {j.title} ({j.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Linked Tailored ATS Resume
                    </label>
                    <select
                      value={stageResumeId}
                      onChange={(e) => setStageResumeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Default Master Profile</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.version_name} (ATS: {r.ats_score || 85}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Submission Notes / Strategy
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Applying via Greenhouse authorized board link with custom ATS resume."
                      value={stageNotes}
                      onChange={(e) => setStageNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Cross-Profile Invariant Enforced</span>
                    </div>
                    <p>
                      If an application for this job posting already exists under another track, the platform will block duplicates automatically.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowStageModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={stagingLoading}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
                    >
                      {stagingLoading ? "Staging..." : "Stage Application"}
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
