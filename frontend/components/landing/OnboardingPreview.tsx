"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  MapPin,
  Sparkles,
} from "lucide-react";

const fields = [
  "Every field",
  "Design",
  "Healthcare",
  "Technology",
  "Business",
  "Education",
];
const opportunities = [
  {
    id: 1,
    field: "Design",
    title: "Product Designer",
    company: "Aster Studio",
    location: "Remote",
  },
  {
    id: 2,
    field: "Healthcare",
    title: "Care Coordinator",
    company: "Bloom Health",
    location: "Hybrid",
  },
  {
    id: 3,
    field: "Technology",
    title: "Software Engineer",
    company: "Forma Systems",
    location: "Remote",
  },
  {
    id: 4,
    field: "Business",
    title: "Brand Strategist",
    company: "Kindred Collective",
    location: "Hybrid",
  },
  {
    id: 5,
    field: "Education",
    title: "Learning Designer",
    company: "Open Chapter",
    location: "Remote",
  },
  {
    id: 6,
    field: "Design",
    title: "Spatial Designer",
    company: "Fieldwork Atelier",
    location: "On-site",
  },
];

export function OnboardingPreview() {
  const [field, setField] = useState("Every field");
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const selected = custom.trim() || field;
  const results = opportunities.filter((job) =>
    custom.trim()
      ? job.field.toLowerCase().includes(selected.toLowerCase()) ||
        job.title.toLowerCase().includes(selected.toLowerCase())
      : field === "Every field" || job.field === field,
  );
  return (
    <main id="main" tabIndex={-1} className="onboarding-main shell">
      <div className="preview-label">
        <Sparkles size={13} aria-hidden="true" /> FRONTEND PREVIEW · NO ACCOUNT
        REQUIRED
      </div>
      <h1 className="onboarding-heading">
        What does your
        <br />
        <span>next chapter look like?</span>
      </h1>
      <p className="onboarding-description">
        Start with a direction that interests you. This is a first look at
        Opporbyte, with fictional opportunities to explore. No personal
        information needed.
      </p>
      <div
        className="onboarding-controls"
        role="group"
        aria-label="Choose a career field"
      >
        {fields.map((option) => (
          <button
            key={option}
            className="industry-button"
            aria-pressed={field === option && !custom.trim()}
            onClick={() => {
              setField(option);
              setCustom("");
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <label className="industry-custom">
        Another field or role?
        <input
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          maxLength={80}
          placeholder="e.g. finance, nursing, architecture"
        />
      </label>
      <section className="demo-results" aria-labelledby="demo-results-title">
        <h2 id="demo-results-title">A few possibilities to picture.</h2>
        <p className="result-note" aria-live="polite">
          {results.length
            ? `${results.length} fictional ${results.length === 1 ? "example" : "examples"} · ${saved.length} saved in this preview`
            : `No fictional examples for “${selected}” in this small preview. Opporbyte is intended for every career field.`}
        </p>
        <div className="demo-job-grid">
          {results.map((job) => (
            <article className="demo-job" key={job.id}>
              <div className="job-industry">
                <span>{job.field}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </div>
              <h3>{job.title}</h3>
              <p className="job-company">{job.company} · Fictional company</p>
              <span className="job-meta">
                <MapPin size={13} aria-hidden="true" />
                {job.location} · Demonstration only
              </span>
              <button
                aria-pressed={saved.includes(job.id)}
                aria-label={`${saved.includes(job.id) ? "Unsave" : "Save"} ${job.title} example`}
                onClick={() =>
                  setSaved((current) =>
                    current.includes(job.id)
                      ? current.filter((id) => id !== job.id)
                      : [...current, job.id],
                  )
                }
              >
                {saved.includes(job.id)
                  ? "Saved in this preview"
                  : "Save example"}
                {saved.includes(job.id) ? (
                  <Check size={16} aria-hidden="true" />
                ) : (
                  <Bookmark size={16} aria-hidden="true" />
                )}
              </button>
            </article>
          ))}
        </div>
      </section>
      <p className="preview-notice">
        This preview does not search for real jobs, match your resume, create an
        account, or submit applications. Selections stay only in this page’s
        memory and reset when you leave or refresh. Resume uploads and
        integrations are planned for a later release.
      </p>
      <Link className="onboarding-back" href="/">
        <ArrowLeft size={15} aria-hidden="true" /> Back to Opporbyte
      </Link>
    </main>
  );
}
