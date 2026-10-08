"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  Code2,
  Save,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Sliders,
  DollarSign,
  Building,
  MapPin,
  Briefcase,
  Layers,
} from "lucide-react";
import { CareerProfile, ProfileType, ProjectItem } from "@/types";
import { api } from "@/lib/api";

const SEMICONDUCTOR_SUGGESTIONS = [
  "VLSI",
  "RTL Design",
  "Digital Design",
  "ASIC Design",
  "Design Verification",
  "FPGA",
  "Embedded Systems",
  "Physical Design",
  "DFT",
];

const SOFTWARE_SUGGESTIONS = [
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Web Development",
  "App Development",
  "Game Development",
  "Software Engineering",
];

interface ProfileEditorProps {
  profileType: ProfileType;
}

export function ProfileEditor({ profileType }: ProfileEditorProps) {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Input state buffers
  const [newTitleTag, setNewTitleTag] = useState("");
  const [newSkillTag, setNewSkillTag] = useState("");
  const [newLocationTag, setNewLocationTag] = useState("");
  const [newExcludedTag, setNewExcludedTag] = useState("");

  // New project dialog buffer
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTechs, setProjectTechs] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setSaveStatus("idle");
    try {
      const data = await api.getProfile(profileType);
      setProfile(data);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [profileType]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const updated = await api.updateProfile(profileType, {
        title: profile.title,
        summary: profile.summary,
        target_job_titles: profile.target_job_titles,
        technical_skills: profile.technical_skills,
        experience_level: profile.experience_level,
        projects: profile.projects,
        preferred_locations: profile.preferred_locations,
        work_preference: profile.work_preference,
        employment_type: profile.employment_type,
        salary_expectation: profile.salary_expectation,
        excluded_companies: profile.excluded_companies,
        matching_threshold: profile.matching_threshold,
      });
      setProfile(updated);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: unknown) {
      setSaveStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to persist profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span className="text-xs font-mono">Loading {profileType} profile from database...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
        Failed to load {profileType} profile. {errorMessage}
      </div>
    );
  }

  const suggestions =
    profileType === "semiconductor" ? SEMICONDUCTOR_SUGGESTIONS : SOFTWARE_SUGGESTIONS;

  return (
    <div className="space-y-6">
      {/* Profile Domain Banner */}
      <div
        className={`p-6 rounded-2xl border ${
          profileType === "semiconductor"
            ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30"
            : "bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/30"
        } flex flex-col md:flex-row md:items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${
              profileType === "semiconductor"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
            }`}
          >
            {profileType === "semiconductor" ? (
              <Cpu className="w-7 h-7" />
            ) : (
              <Code2 className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">
                Independent Domain Profile
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                Isolated State
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
              {profileType} Engineering Profile
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
            profileType === "semiconductor"
              ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
              : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
          } disabled:opacity-50`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Persisting Changes..." : "Save Profile Changes"}</span>
        </button>
      </div>

      {/* Save Feedback Alerts */}
      {saveStatus === "success" && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Changes saved successfully to database! Profile isolation verified.</span>
        </div>
      )}
      {saveStatus === "error" && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error saving: {errorMessage}</span>
        </div>
      )}

      {/* Core Profile Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Role & Interests */}
        <div className="space-y-6">
          {/* Headline & Summary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Headline & Summary
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Profile Title
              </label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Career Summary
              </label>
              <textarea
                rows={3}
                value={profile.summary || ""}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                placeholder="High-level engineering focus and mission..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Experience Level
              </label>
              <select
                value={profile.experience_level}
                onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Intern">Intern</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Staff">Staff</option>
                <option value="Principal">Principal / Architect</option>
              </select>
            </div>
          </div>

          {/* Target Job Titles & Quick Suggestions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Target Job Titles & Focus Areas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keywords matched against incoming job postings for this career profile.
            </p>

            {/* Quick add suggested chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider font-mono">
                Suggested {profileType} interests:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug) => {
                  const alreadyAdded = profile.target_job_titles.includes(sug);
                  return (
                    <button
                      key={sug}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() =>
                        setProfile({
                          ...profile,
                          target_job_titles: [...profile.target_job_titles, sug],
                        })
                      }
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        alreadyAdded
                          ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                    >
                      + {sug}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Target Titles Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.target_job_titles.map((title, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-medium"
                >
                  {title}
                  <button
                    type="button"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        target_job_titles: profile.target_job_titles.filter((_, i) => i !== idx),
                      })
                    }
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add custom title */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add custom job title..."
                value={newTitleTag}
                onChange={(e) => setNewTitleTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTitleTag.trim()) {
                    e.preventDefault();
                    setProfile({
                      ...profile,
                      target_job_titles: [...profile.target_job_titles, newTitleTag.trim()],
                    });
                    setNewTitleTag("");
                  }
                }}
                className="flex-1 px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTitleTag.trim()) {
                    setProfile({
                      ...profile,
                      target_job_titles: [...profile.target_job_titles, newTitleTag.trim()],
                    });
                    setNewTitleTag("");
                  }
                }}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Verified Technical Skills
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only verified skills you possess. Opporbyte never hallucinates or invents skills.
            </p>

            <div className="flex flex-wrap gap-2">
              {profile.technical_skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  No technical skills added yet. Add your verified skills below.
                </span>
              ) : (
                profile.technical_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          technical_skills: profile.technical_skills.filter((_, i) => i !== idx),
                        })
                      }
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add skill input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder={
                  profileType === "semiconductor"
                    ? "e.g. SystemVerilog, UVM, Synopsys DC..."
                    : "e.g. TypeScript, Next.js, FastAPI..."
                }
                value={newSkillTag}
                onChange={(e) => setNewSkillTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSkillTag.trim()) {
                    e.preventDefault();
                    setProfile({
                      ...profile,
                      technical_skills: [...profile.technical_skills, newSkillTag.trim()],
                    });
                    setNewSkillTag("");
                  }
                }}
                className="flex-1 px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  if (newSkillTag.trim()) {
                    setProfile({
                      ...profile,
                      technical_skills: [...profile.technical_skills, newSkillTag.trim()],
                    });
                    setNewSkillTag("");
                  }
                }}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences, Matching Threshold & Projects */}
        <div className="space-y-6">
          {/* Matching Threshold & Preferences */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" />
              Matching Threshold & Preferences
            </h3>

            {/* Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Minimum Matching Threshold
                </span>
                <span className="font-black font-mono text-sm text-indigo-600 dark:text-indigo-400">
                  {profile.matching_threshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={profile.matching_threshold}
                onChange={(e) =>
                  setProfile({ ...profile, matching_threshold: parseInt(e.target.value, 10) })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[11px] text-slate-400">
                Jobs scoring below this threshold will not trigger high-priority alerts.
              </span>
            </div>

            {/* Work Modality */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Work Modality Preferences
              </label>
              <div className="flex gap-4 text-xs">
                {["remote", "hybrid", "on-site"].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer capitalize">
                    <input
                      type="checkbox"
                      checked={profile.work_preference.includes(mode)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...profile.work_preference, mode]
                          : profile.work_preference.filter((m) => m !== mode);
                        setProfile({ ...profile, work_preference: next });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Employment Types
              </label>
              <div className="flex gap-4 text-xs">
                {["full-time", "internship", "contract"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer capitalize">
                    <input
                      type="checkbox"
                      checked={profile.employment_type.includes(type)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...profile.employment_type, type]
                          : profile.employment_type.filter((t) => t !== type);
                        setProfile({ ...profile, employment_type: next });
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Expectations */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Salary Expectations
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Minimum Base ($)</span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={profile.salary_expectation.min_salary || 0}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        salary_expectation: {
                          ...profile.salary_expectation,
                          min_salary: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Target Base ($)</span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={profile.salary_expectation.target_salary || 0}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        salary_expectation: {
                          ...profile.salary_expectation,
                          target_salary: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Preferred Locations
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.preferred_locations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                  >
                    {loc}
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          preferred_locations: profile.preferred_locations.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Austin, TX, San Jose, CA, Remote..."
                  value={newLocationTag}
                  onChange={(e) => setNewLocationTag(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newLocationTag.trim()) {
                      setProfile({
                        ...profile,
                        preferred_locations: [...profile.preferred_locations, newLocationTag.trim()],
                      });
                      setNewLocationTag("");
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Excluded Companies */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Excluded Companies (Blacklist)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {profile.excluded_companies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs"
                  >
                    {comp}
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          excluded_companies: profile.excluded_companies.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Exclude company name..."
                  value={newExcludedTag}
                  onChange={(e) => setNewExcludedTag(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newExcludedTag.trim()) {
                      setProfile({
                        ...profile,
                        excluded_companies: [...profile.excluded_companies, newExcludedTag.trim()],
                      });
                      setNewExcludedTag("");
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Exclude
                </button>
              </div>
            </div>
          </div>

          {/* Projects Portfolio */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Projects & Highlights ({profile.projects.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProject(!showAddProject)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddProject ? "Cancel" : "Add Project"}</span>
              </button>
            </div>

            {showAddProject && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <input
                  type="text"
                  placeholder="Project title..."
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <textarea
                  rows={2}
                  placeholder="Description and key outcomes..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Technologies used (comma separated)..."
                  value={projectTechs}
                  onChange={(e) => setProjectTechs(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (projectTitle.trim()) {
                      const newProj: ProjectItem = {
                        title: projectTitle.trim(),
                        description: projectDesc.trim(),
                        technologies: projectTechs
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                        highlights: [],
                      };
                      setProfile({
                        ...profile,
                        projects: [...profile.projects, newProj],
                      });
                      setProjectTitle("");
                      setProjectDesc("");
                      setProjectTechs("");
                      setShowAddProject(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Save Project to Profile
                </button>
              </div>
            )}

            <div className="space-y-3">
              {profile.projects.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No projects added yet for this profile.
                </p>
              ) : (
                profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 relative group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          projects: profile.projects.filter((_, i) => i !== idx),
                        })
                      }
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {proj.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
