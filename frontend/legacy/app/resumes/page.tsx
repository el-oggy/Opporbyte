"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Layers,
  History,
  FileCheck,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  Send,
  Trash2,
  X,
  Code2,
  Eye,
  Check,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import {
  CandidateFact,
  Job,
  ProfileType,
  ResumeExport,
  ResumeVersion,
} from "@/types";
import { api } from "@/lib/api";

export default function ResumeStudioPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");
  const [activeTab, setActiveTab] = useState<"resumes" | "facts">("resumes");

  // Resumes state
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeVersion | null>(null);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(true);

  // Facts state
  const [facts, setFacts] = useState<CandidateFact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loadingFacts, setLoadingFacts] = useState<boolean>(true);

  // Modal states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showTailorModal, setShowTailorModal] = useState<boolean>(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [tailorVersionName, setTailorVersionName] = useState<string>("");
  const [tailoringLoading, setTailoringLoading] = useState<boolean>(false);

  // New Fact Modal
  const [showAddFactModal, setShowAddFactModal] = useState<boolean>(false);
  const [newFactCategory, setNewFactCategory] = useState<string>("skill");
  const [newFactTitle, setNewFactTitle] = useState<string>("");
  const [newFactDescription, setNewFactDescription] = useState<string>("");
  const [newFactVerified, setNewFactVerified] = useState<boolean>(true);
  const [creatingFact, setCreatingFact] = useState<boolean>(false);

  // Export Modal
  const [exportData, setExportData] = useState<ResumeExport | null>(null);
  const [exportFormat, setExportFormat] = useState<"text" | "html">("text");
  const [copied, setCopied] = useState<boolean>(false);

  // Message banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotice = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch data
  const loadResumes = async () => {
    setLoadingResumes(true);
    try {
      const data = await api.getResumes(activeProfile);
      setResumes(data);
      if (data.length > 0 && !selectedResume) {
        setSelectedResume(data[0]);
      } else if (data.length > 0 && selectedResume) {
        const stillExists = data.find((r) => r.id === selectedResume.id);
        setSelectedResume(stillExists || data[0]);
      } else {
        setSelectedResume(null);
      }
    } catch {
      // ignore
    } finally {
      setLoadingResumes(false);
    }
  };

  const loadFacts = async () => {
    setLoadingFacts(true);
    try {
      const cat = selectedCategory === "all" ? undefined : selectedCategory;
      const data = await api.getFacts(cat);
      setFacts(data);
    } catch {
      // ignore
    } finally {
      setLoadingFacts(false);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadResumes();
    loadFacts();
    loadJobs();
  }, [activeProfile]);

  useEffect(() => {
    loadFacts();
  }, [selectedCategory]);

  // Actions
  const handleTailorResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    setTailoringLoading(true);
    try {
      const targetJob = jobs.find((j) => j.id === selectedJobId);
      const name = tailorVersionName || (targetJob ? `${targetJob.company} - ${targetJob.title}` : undefined);
      const created = await api.tailorResume(activeProfile, selectedJobId, name);
      showNotice("success", `ATS Resume tailored for ${targetJob?.company || "role"} with ${created.ats_score}% compatibility!`);
      setShowTailorModal(false);
      setTailorVersionName("");
      await loadResumes();
      setSelectedResume(created);
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to tailor resume");
    } finally {
      setTailoringLoading(false);
    }
  };

  const handleToggleFactVerification = async (fact: CandidateFact) => {
    try {
      const updated = await api.updateFact(fact.id, { verified: !fact.verified });
      setFacts((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      showNotice(
        "success",
        updated.verified
          ? `Fact verified and enabled for resume synthesis!`
          : `Fact marked unverified (excluded from resume engine).`
      );
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to update fact");
    }
  };

  const handleSeedFacts = async () => {
    try {
      const seeded = await api.seedFacts();
      setFacts(seeded);
      showNotice("success", `Loaded ${seeded.length} curated starter facts with verified provenance!`);
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to seed facts");
    }
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactTitle || !newFactDescription) return;

    setCreatingFact(true);
    try {
      const created = await api.createFact({
        category: newFactCategory,
        title: newFactTitle,
        description: newFactDescription,
        verified: newFactVerified,
        source: "manual_studio",
      });
      setFacts((prev) => [created, ...prev]);
      setShowAddFactModal(false);
      setNewFactTitle("");
      setNewFactDescription("");
      showNotice("success", "Candidate fact recorded with provenance tracking.");
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to create fact");
    } finally {
      setCreatingFact(false);
    }
  };

  const handleOpenExport = async (resumeId: string) => {
    try {
      const exp = await api.exportResume(resumeId);
      setExportData(exp);
      setExportFormat("text");
      setCopied(false);
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to generate resume export");
    }
  };

  const handleCopyExport = () => {
    if (!exportData) return;
    const content = exportFormat === "text" ? exportData.plain_text : exportData.html_content;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExport = () => {
    if (!exportData) return;
    const isText = exportFormat === "text";
    const content = isText ? exportData.plain_text : exportData.html_content;
    const mime = isText ? "text/plain" : "text/html";
    const ext = isText ? "txt" : "html";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportData.version_name.replace(/[^a-zA-Z0-9_-]/g, "_")}_resume.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStageInPipeline = async (resume: ResumeVersion) => {
    if (!resume.job_id) return;
    try {
      await api.stageApplication(
        activeProfile,
        resume.job_id,
        resume.id,
        `Staged from Resume Studio (${resume.version_name})`
      );
      showNotice("success", `Application package staged in Human Review Queue!`);
    } catch (err: any) {
      showNotice("error", err?.message || "Failed to stage application");
    }
  };

  // Group facts of selected resume by section
  const resumeSections: Record<string, any[]> = {};
  if (selectedResume?.selected_facts) {
    for (const f of selectedResume.selected_facts) {
      const sec = f.section || "Experience";
      if (!resumeSections[sec]) resumeSections[sec] = [];
      resumeSections[sec].push(f);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070b14]">
      <Sidebar activeProfile={activeProfile} onProfileChange={setActiveProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Resume Studio"
          description="Verified fact-based resume tailoring and ATS-optimized document generation."
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
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
                <span>{notification.text}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zero Hallucination Guarantee Banner */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px]">
                STRICT FACTUAL INTEGRITY & ZERO-HALLUCINATION GUARANTEE
              </span>
              <p className="mt-1 leading-relaxed">
                Opporbyte prohibits generative hallucination. Tailored resumes are assembled solely from verified candidate facts stored in the database. Every bullet point links back to its verified source fact ID. No skills, metrics, or previous employers are ever hallucinated.
              </p>
            </div>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("resumes")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "resumes"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tailored Resumes ({resumes.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("facts")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "facts"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Candidate Facts Repository ({facts.length})</span>
              </button>
            </div>

            {activeTab === "resumes" ? (
              <button
                type="button"
                onClick={() => setShowTailorModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tailor Resume for Target Job</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {facts.length === 0 && (
                  <button
                    type="button"
                    onClick={handleSeedFacts}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs text-slate-600 dark:text-slate-300 font-medium transition-colors"
                  >
                    Seed Starter Facts
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAddFactModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Candidate Fact</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: TAILORED RESUMES */}
          {activeTab === "resumes" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Versions list */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span>Customized Versions ({activeProfile})</span>
                  <span>ATS Score</span>
                </div>

                {loadingResumes ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    Loading tailored resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        No tailored resumes for {activeProfile} track
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Select a target job and synthesize an ATS-compliant resume grounded in your verified facts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTailorModal(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tailor First Resume</span>
                    </button>
                  </div>
                ) : (
                  resumes.map((item) => {
                    const isSelected = selectedResume?.id === item.id;
                    const ats = item.ats_score || 85;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedResume(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500"
                            : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.version_name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{item.job_company || "Target Role"}</span>
                              <span>&bull;</span>
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div
                            className={`px-2.5 py-1 rounded-xl text-xs font-extrabold font-mono shrink-0 ${
                              ats >= 85
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                            }`}
                          >
                            {ats}%
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.selected_facts.length} Verified Facts</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Selected Resume Inspection */}
              <div className="lg:col-span-7">
                {selectedResume ? (
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {selectedResume.version_name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Zero-Hallucination
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Tailored for {selectedResume.job_company || "Target Posting"} &bull; Generated {new Date(selectedResume.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenExport(selectedResume.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Export / Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStageInPipeline(selectedResume)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Stage for Review</span>
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Professional Summary
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        {selectedResume.summary}
                      </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-5">
                      {Object.entries(resumeSections).map(([secName, items]) => (
                        <div key={secName} className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {secName} ({items.length})
                          </span>
                          <div className="space-y-2">
                            {items.map((it, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {it.title}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Grounded Fact #{it.fact_id.substring(0, 6)}</span>
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                  {it.bullet_text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                    Select a resume version on the left to inspect its grounded facts and ATS layout.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE FACTS REPOSITORY */}
          {activeTab === "facts" && (
            <div className="space-y-6">
              {/* Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {["all", "skill", "experience", "project", "education", "certification"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Facts Grid */}
              {loadingFacts ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  Loading candidate facts...
                </div>
              ) : facts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Candidate Facts Found
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    The zero-hallucination engine requires verified facts before tailoring resumes. Seed the starter repository or add your achievements.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSeedFacts}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
                    >
                      Seed Starter Facts
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddFactModal(true)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
                    >
                      Add Custom Fact
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facts.map((fact) => (
                    <div
                      key={fact.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                            {fact.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              fact.verified
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {fact.verified ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{fact.verified ? "Verified" : "Unverified"}</span>
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {fact.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {fact.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 text-[10px] font-mono">
                          Source: {fact.source}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleFactVerification(fact)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            fact.verified
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {fact.verified ? "Revoke Verification" : "Verify Fact"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODAL 1: TAILOR RESUME */}
          {showTailorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Tailor ATS Resume ({activeProfile})
                    </h3>
                  </div>
                  <button onClick={() => setShowTailorModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleTailorResume} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target Canonical Job Posting
                    </label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
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
                      Version Title / Identifier (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nvidia - Senior Verification Engineer"
                      value={tailorVersionName}
                      onChange={(e) => setTailorVersionName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Hallucination Guaranteed</span>
                    </div>
                    <p>
                      The engine queries {facts.filter((f) => f.verified).length} verified candidate facts in the repository and synthesizes ATS-formatted sections with complete provenance tracking.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTailorModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={tailoringLoading}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                    >
                      {tailoringLoading ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Tailored Resume</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: ADD CANDIDATE FACT */}
          {showAddFactModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Record Verified Candidate Fact
                    </h3>
                  </div>
                  <button onClick={() => setShowAddFactModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateFact} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={newFactCategory}
                      onChange={(e) => setNewFactCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="skill">Skill</option>
                      <option value="experience">Professional Experience</option>
                      <option value="project">Key Project</option>
                      <option value="education">Education & Degree</option>
                      <option value="certification">Certification</option>
                      <option value="achievement">Achievement</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Headline or Skill Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PCIe Gen 4 Protocol Verification"
                      value={newFactTitle}
                      onChange={(e) => setNewFactTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Factual Evidentiary Metric / Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Architected UVM scoreboard verifying 256 physical functions with zero packet corruption."
                      value={newFactDescription}
                      onChange={(e) => setNewFactDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="fact-verified"
                      checked={newFactVerified}
                      onChange={(e) => setNewFactVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="fact-verified" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Mark as Human Verified (Permits usage in ATS resume tailoring)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFactModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingFact}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
                    >
                      {creatingFact ? "Saving..." : "Save Fact"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 3: EXPORT / PREVIEW MODAL */}
          {exportData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {exportData.version_name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        ATS Score: {exportData.ats_score || 0}% &bull; 100% Verified Provenance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyExport}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handleDownloadExport}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <button onClick={() => setExportData(null)} className="text-slate-400 hover:text-slate-600 ml-2">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Format switcher */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExportFormat("text")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === "text"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    ATS Clean Plain Text
                  </button>
                  <button
                    onClick={() => setExportFormat("html")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      exportFormat === "html"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    HTML Print / Preview
                  </button>
                </div>

                {/* Preview window */}
                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
                  {exportFormat === "text" ? (
                    <pre className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">
                      {exportData.plain_text}
                    </pre>
                  ) : (
                    <div className="bg-white text-slate-900 p-6 rounded-xl shadow">
                      <iframe
                        srcDoc={exportData.html_content}
                        title="Resume Preview"
                        className="w-full h-[400px] border-0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
