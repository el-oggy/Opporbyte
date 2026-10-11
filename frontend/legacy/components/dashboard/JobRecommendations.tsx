"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Building2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Info,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { JobMatch, ProfileType } from "@/types";
import { api } from "@/lib/api";

interface JobRecommendationsProps {
  activeProfile: ProfileType;
}

export function JobRecommendations({ activeProfile }: JobRecommendationsProps) {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await api.getMatches(activeProfile);
      setMatches(data);
    } catch {
      // Fallback
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      await api.evaluateMatches(activeProfile);
      await fetchMatches();
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [activeProfile]);

  return (
    <div className="space-y-4">
      {/* Live AI Matching Engine Header Banner */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] block">
              AI MATCHING ENGINE ACTIVE — 4-FACTOR HEURISTIC
            </span>
            <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">
              Evaluated with deterministic weights: Skills (40%), Experience (25%), Role Alignment (20%), Preferences (15%).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunEvaluation}
          disabled={evaluating}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? "animate-spin" : ""}`} />
          <span>{evaluating ? "Evaluating..." : "Re-evaluate Matches"}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Scoring discovered opportunities against {activeProfile} profile...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <p className="text-xs text-slate-500">No scored matches available yet for {activeProfile}.</p>
          <button
            type="button"
            onClick={handleRunEvaluation}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Run AI Matching Engine Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {matches.slice(0, 5).map((match) => {
            const job = match.job;
            if (!job) return null;
            const evidence = match.match_evidence;
            const bd = evidence.score_breakdown || {
              required_skills_score: match.required_skills_score,
              experience_score: match.experience_score,
              alignment_score: match.alignment_score,
              preferences_score: match.preferences_score,
            };

            const isStrong = match.overall_score >= 80;

            return (
              <div
                key={match.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-500/40 dark:hover:border-indigo-500/40 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {job.work_mode.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {job.employment_type}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {job.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Match Score */}
                  <div className="flex items-center gap-4 self-start md:self-auto shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Sparkles
                          className={`w-4 h-4 ${
                            isStrong ? "text-emerald-500" : "text-cyan-500"
                          }`}
                        />
                        <span
                          className={`text-2xl font-black ${
                            isStrong ? "text-emerald-500" : "text-cyan-500"
                          }`}
                        >
                          {match.overall_score}%
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider block ${
                          isStrong
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-cyan-600 dark:text-cyan-400"
                        }`}
                      >
                        {match.classification} match
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Factor Heuristic Breakdown Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400">Matched Skills:</span>
                    {evidence.matched_skills.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                      >
                        {skill}
                      </span>
                    ))}
                    {evidence.matched_skills.length === 0 && (
                      <span className="text-slate-400 italic text-[11px]">Domain aligned</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMatch(match)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                    >
                      <Info className="w-3 h-3" />
                      <span>View AI Evidence</span>
                    </button>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300"
                    >
                      <span>Apply Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Match Evidence Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-500 font-bold">
                  AI Match Audit Evidence
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedMatch.job?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedMatch.job?.company} • {selectedMatch.job?.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Breakdown (40/25/20/15) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Heuristic Scoring Weights Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Required Skills (40%):</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {selectedMatch.required_skills_score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${selectedMatch.required_skills_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience & Projects (25%):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {selectedMatch.experience_score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${selectedMatch.experience_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role Alignment (20%):</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      {selectedMatch.alignment_score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${selectedMatch.alignment_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preferences Match (15%):</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {selectedMatch.preferences_score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${selectedMatch.preferences_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rationale and Matched Skills */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Evaluation Evidence & Rationales
              </h4>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedMatch.match_evidence.explanation}
              </p>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Matched Competencies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatch.match_evidence.matched_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                  {selectedMatch.match_evidence.matched_skills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No specific direct skill matches</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
