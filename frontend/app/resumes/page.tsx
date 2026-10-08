"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Layers,
  History,
  FileCheck,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProfileType } from "@/types";

export default function ResumeStudioPage() {
  const [activeProfile, setActiveProfile] = useState<ProfileType>("semiconductor");

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
          {/* Zero Hallucination Guarantee Banner */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px]">
                STRICT FACTUAL INTEGRITY & PROVENANCE GUARANTEE
              </span>
              <p className="mt-1 leading-relaxed">
                Opporbyte prohibits generative hallucination. Tailored resumes are assembled solely from verified candidate facts stored in the database. Every bullet point links back to its verified source fact ID. Interfaces are specified in <code className="font-mono bg-emerald-500/20 px-1 py-0.5 rounded">backend/app/services/interfaces/resume.py</code>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Master Fact Repository Status */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Master Facts Repository
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Import and review career facts before tailoring resumes. Only verified facts are permitted in generated documents.
              </p>

              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Master Resume (PDF/DOCX)</span>
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Candidate Facts Table:</span>
                  <span className="font-mono text-emerald-500">Live in DB</span>
                </div>
                <div className="flex justify-between">
                  <span>Fact Verification Status:</span>
                  <span className="font-mono text-slate-300">Human Required</span>
                </div>
              </div>
            </div>

            {/* Resume Versioning History */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tailored Resume Versions ({activeProfile})
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Phase 3 Engine Staging
                </span>
              </div>

              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <FileCheck className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Ready for Job-Specific Tailoring
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  When a strong match is approved, the resume engine selects relevant skills and achievements for {activeProfile} and compiles an ATS-compliant PDF.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
