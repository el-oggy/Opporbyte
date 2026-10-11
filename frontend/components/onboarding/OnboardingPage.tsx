"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Badge, Brand, Button, ButtonLink, Field } from "../ui";
import styles from "./onboarding.module.css";

const industries: Record<string, string[]> = {
  Engineering: [
    "Mechanical engineer",
    "Electrical engineer",
    "Process engineer",
  ],
  Software: ["Software engineer", "Data engineer", "Frontend developer"],
  Design: ["Product designer", "Graphic designer", "UX researcher"],
  Healthcare: ["Registered nurse", "Clinical researcher", "Care coordinator"],
  Finance: ["Financial analyst", "Accountant", "Risk analyst"],
  Marketing: ["Marketing strategist", "Content specialist", "Brand manager"],
  Education: ["Teacher", "Learning designer", "Academic advisor"],
  Research: ["Research associate", "Research scientist", "Lab technician"],
  "Other / custom": [],
};
const steps = [
  "Career interests",
  "Preferences",
  "Candidate profile",
  "Review & continue",
];
const descriptions = [
  "Start with the work you want to do.",
  "Make space for what matters to you.",
  "Bring your experience into focus.",
  "Your next chapter, with a clearer starting point.",
];
const toggle = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState("Design");
  const [roles, setRoles] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState("");
  const [locations, setLocations] = useState("");
  const [workModes, setWorkModes] = useState<string[]>(["Remote"]);
  const [employment, setEmployment] = useState("Full-time");
  const [experience, setExperience] = useState("Mid-level");
  const [compensation, setCompensation] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [profileMode, setProfileMode] = useState("resume");
  const [resume, setResume] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const suggestions = (industries[industry] ?? []).filter(
    (role) =>
      role.toLowerCase().includes(roleSearch.toLowerCase()) &&
      !roles.includes(role),
  );

  function changeStep(next: number) {
    setError("");
    setStep(next);
    window.requestAnimationFrame(() => heading.current?.focus());
  }
  function showError(message: string) {
    setError(message);
    window.requestAnimationFrame(() => errorRef.current?.focus());
  }
  function next(event: FormEvent) {
    event.preventDefault();
    if (step === 0 && roles.length === 0) {
      showError("Choose at least one target role, or add your own.");
      return;
    }
    if (step === 1 && workModes.length === 0) {
      showError("Choose at least one work arrangement.");
      return;
    }
    if (
      step === 1 &&
      compensation &&
      (!Number.isFinite(Number(compensation)) || Number(compensation) < 0)
    ) {
      showError(
        "Enter a positive annual compensation amount, or leave it blank.",
      );
      return;
    }
    changeStep(Math.min(3, step + 1));
  }
  function addRole() {
    const value = roleSearch.trim();
    if (!value) return;
    if (roles.length >= 8) {
      showError("Keep up to eight target roles so your search stays focused.");
      return;
    }
    setRoles((values) =>
      values.some((item) => item.toLowerCase() === value.toLowerCase())
        ? values
        : [...values, value],
    );
    setRoleSearch("");
    setError("");
  }
  function addSpecialization() {
    const value = specialization.trim();
    if (
      value &&
      specializations.length < 8 &&
      !specializations.some(
        (item) => item.toLowerCase() === value.toLowerCase(),
      )
    )
      setSpecializations((values) => [...values, value]);
    setSpecialization("");
  }
  function selectFile(file?: File) {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      showError("Choose a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError("Choose a file smaller than 10 MB.");
      return;
    }
    setResume(file);
    setError("");
  }
  return (
    <div className={styles.page}>
      <a href="#onboarding-main" className="skip-link">
        Skip to career preferences
      </a>
      <header className={styles.header}>
        <Brand />
        <ButtonLink href="/login" variant="ghost">
          Owner sign in <ArrowRight size={16} aria-hidden="true" />
        </ButtonLink>
      </header>
      <main id="onboarding-main" className={styles.layout}>
        <section
          className={styles.formArea}
          aria-label="Career onboarding preview"
        >
          <div className={styles.previewNote}>
            <Badge tone="cyan">Onboarding preview</Badge>
            <span>No account is created. Your choices stay in this page.</span>
          </div>
          <ol className={styles.steps} aria-label="Onboarding progress">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={step === index ? "step" : undefined}
              >
                <span
                  className={`${styles.stepDot} ${index <= step ? styles.activeDot : ""}`}
                >
                  {index < step ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
          <div className={styles.titleRow}>
            <p className={styles.stepLabel}>Step {step + 1} of 4</p>
            <h1 ref={heading} tabIndex={-1}>
              {steps[step]}
            </h1>
            <p>{descriptions[step]}</p>
          </div>
          <form onSubmit={next} noValidate>
            {error && (
              <p
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                className={styles.error}
              >
                {error}
              </p>
            )}
            {step === 0 && (
              <div className={styles.fields}>
                <fieldset className={styles.fieldset}>
                  <legend>Which field are you exploring?</legend>
                  <div className={styles.choices}>
                    {Object.keys(industries).map((item) => (
                      <button
                        type="button"
                        className={
                          industry === item
                            ? styles.selectedChoice
                            : styles.choice
                        }
                        key={item}
                        aria-pressed={industry === item}
                        onClick={() => {
                          setIndustry(item);
                          setRoleSearch("");
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <Field
                  label="Target job titles"
                  htmlFor="target-role"
                  hint="Choose suggestions or type any title. You can add up to eight."
                >
                  <div className={styles.inputAction}>
                    <input
                      id="target-role"
                      autoComplete="off"
                      maxLength={100}
                      placeholder="Search or enter a role"
                      value={roleSearch}
                      onChange={(event) => setRoleSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addRole();
                        }
                      }}
                    />
                    <Button
                      variant="secondary"
                      aria-label="Add target role"
                      disabled={!roleSearch.trim()}
                      onClick={addRole}
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </Field>
                {suggestions.length > 0 && (
                  <div
                    className={styles.suggestions}
                    aria-label="Suggested job titles"
                  >
                    {suggestions.map((role) => (
                      <button
                        type="button"
                        key={role}
                        disabled={roles.length >= 8}
                        onClick={() => {
                          setRoles((values) => [...values, role]);
                          setError("");
                        }}
                      >
                        <Plus size={13} aria-hidden="true" />
                        {role}
                      </button>
                    ))}
                  </div>
                )}
                {roles.length > 0 && (
                  <div
                    className={styles.tags}
                    aria-label="Selected target titles"
                  >
                    {roles.map((role) => (
                      <button
                        type="button"
                        key={role}
                        aria-label={`Remove ${role}`}
                        onClick={() =>
                          setRoles((values) =>
                            values.filter((item) => item !== role),
                          )
                        }
                      >
                        {role}
                        <X size={13} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
                <Field
                  label="Specializations or interests (optional)"
                  htmlFor="specialization"
                  hint="For example: accessibility, patient care, sustainable design."
                >
                  <div className={styles.inputAction}>
                    <input
                      id="specialization"
                      maxLength={80}
                      placeholder="Add an area you care about"
                      value={specialization}
                      onChange={(event) =>
                        setSpecialization(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSpecialization();
                        }
                      }}
                    />
                    <Button
                      variant="secondary"
                      disabled={
                        !specialization.trim() || specializations.length >= 8
                      }
                      aria-label="Add specialization"
                      onClick={addSpecialization}
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </Field>
                {specializations.length > 0 && (
                  <div className={styles.tags}>
                    {specializations.map((item) => (
                      <button
                        type="button"
                        key={item}
                        aria-label={`Remove specialization ${item}`}
                        onClick={() =>
                          setSpecializations((values) =>
                            values.filter((value) => value !== item),
                          )
                        }
                      >
                        {item}
                        <X size={13} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {step === 1 && (
              <div className={styles.fields}>
                <Field
                  label="Preferred locations (optional)"
                  htmlFor="locations"
                  hint="Separate cities, regions or countries with commas."
                >
                  <input
                    id="locations"
                    maxLength={250}
                    placeholder="Bengaluru, London, anywhere remote"
                    value={locations}
                    onChange={(event) => setLocations(event.target.value)}
                  />
                </Field>
                <fieldset className={styles.fieldset}>
                  <legend>Work arrangement</legend>
                  <div className={styles.choices}>
                    {["Remote", "Hybrid", "On-site"].map((item) => (
                      <button
                        type="button"
                        className={
                          workModes.includes(item)
                            ? styles.selectedChoice
                            : styles.choice
                        }
                        key={item}
                        aria-pressed={workModes.includes(item)}
                        onClick={() => {
                          setWorkModes((values) => toggle(values, item));
                          setError("");
                        }}
                      >
                        {workModes.includes(item) && (
                          <Check size={14} aria-hidden="true" />
                        )}
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className={styles.twoColumns}>
                  <Field label="Employment type" htmlFor="employment">
                    <select
                      id="employment"
                      value={employment}
                      onChange={(event) => setEmployment(event.target.value)}
                    >
                      {[
                        "Full-time",
                        "Part-time",
                        "Contract",
                        "Internship",
                        "Flexible",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Experience level" htmlFor="experience">
                    <select
                      id="experience"
                      value={experience}
                      onChange={(event) => setExperience(event.target.value)}
                    >
                      {[
                        "Entry-level",
                        "Mid-level",
                        "Senior",
                        "Lead / management",
                        "Open to possibilities",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className={styles.compensation}>
                  <Field
                    label="Target annual compensation (optional)"
                    htmlFor="compensation"
                    hint="A preference for this preview, not a salary prediction."
                  >
                    <input
                      id="compensation"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Leave open"
                      value={compensation}
                      onChange={(event) => setCompensation(event.target.value)}
                    />
                  </Field>
                  <Field label="Currency" htmlFor="currency">
                    <select
                      id="currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                    >
                      {["USD", "INR", "EUR", "GBP", "CAD", "AUD"].map(
                        (item) => (
                          <option key={item}>{item}</option>
                        ),
                      )}
                    </select>
                  </Field>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className={styles.fields}>
                <div
                  className={styles.modeSwitch}
                  role="group"
                  aria-label="Candidate profile method"
                >
                  <button
                    type="button"
                    aria-pressed={profileMode === "resume"}
                    onClick={() => {
                      setProfileMode("resume");
                      setError("");
                    }}
                  >
                    Choose a resume
                  </button>
                  <button
                    type="button"
                    aria-pressed={profileMode === "manual"}
                    onClick={() => {
                      setProfileMode("manual");
                      setError("");
                    }}
                  >
                    Enter manually
                  </button>
                </div>
                {profileMode === "resume" ? (
                  <>
                    <div
                      className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        selectFile(event.dataTransfer.files[0]);
                      }}
                    >
                      <span className={styles.uploadIcon}>
                        <Upload size={24} aria-hidden="true" />
                      </span>
                      <h2>
                        {resume
                          ? "File selected for this preview"
                          : "Start with your experience."}
                      </h2>
                      <p>
                        Drop a PDF or DOCX here, or choose a file.
                        <br />
                        Up to 10 MB. Optional.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => fileInput.current?.click()}
                      >
                        {resume ? "Choose a different file" : "Choose resume"}
                      </Button>
                      <input
                        ref={fileInput}
                        type="file"
                        accept=".pdf,.docx"
                        aria-label="Choose a resume file"
                        className={styles.fileInput}
                        tabIndex={-1}
                        onChange={(event) => {
                          selectFile(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </div>
                    {resume && (
                      <div className={styles.fileSelected} role="status">
                        <FileText size={20} aria-hidden="true" />
                        <div>
                          <strong>{resume.name}</strong>
                          <span>
                            {(resume.size / 1024).toFixed(0)} KB · Held in this
                            page only
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          aria-label="Remove selected resume"
                          onClick={() => setResume(null)}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Field
                      label="Your name (optional)"
                      htmlFor="candidate-name"
                    >
                      <input
                        id="candidate-name"
                        autoComplete="name"
                        maxLength={100}
                        placeholder="How would you like to be addressed?"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </Field>
                    <Field
                      label="Experience summary (optional)"
                      htmlFor="candidate-summary"
                    >
                      <textarea
                        id="candidate-summary"
                        maxLength={1500}
                        rows={4}
                        placeholder="Describe your experience in your own words."
                        value={summary}
                        onChange={(event) => setSummary(event.target.value)}
                      />
                    </Field>
                    <Field label="Skills (optional)" htmlFor="candidate-skills">
                      <input
                        id="candidate-skills"
                        maxLength={400}
                        placeholder="For example: Figma, research, team leadership"
                        value={skills}
                        onChange={(event) => setSkills(event.target.value)}
                      />
                    </Field>
                  </>
                )}
                <div className={styles.privacy}>
                  <ShieldCheck size={20} aria-hidden="true" />
                  <p>
                    <strong>Your information stays with you.</strong> This
                    preview does not upload, parse, save or send your resume or
                    profile. File contents are not read. Closing or refreshing
                    the page clears your choices.
                  </p>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className={styles.fields}>
                <div className={styles.summary}>
                  <div>
                    <span>Career direction</span>
                    <strong>{industry}</strong>
                    <p>{roles.join(", ")}</p>
                    {specializations.length > 0 && (
                      <p>{specializations.join(", ")}</p>
                    )}
                  </div>
                  <div>
                    <span>Your preferences</span>
                    <strong>
                      {workModes.join(" / ")} · {employment}
                    </strong>
                    <p>
                      {locations || "Location open"} · {experience}
                    </p>
                    {compensation && (
                      <p>
                        {currency}{" "}
                        {Number(compensation).toLocaleString("en-US")} per year
                      </p>
                    )}
                  </div>
                  <div>
                    <span>Candidate profile</span>
                    <strong>
                      {profileMode === "resume"
                        ? resume?.name || "No resume selected"
                        : name || "Manual profile"}
                    </strong>
                    <p>
                      {profileMode === "resume"
                        ? "Resume upload is not active in this preview."
                        : summary ||
                          "You can add verified experience in the existing workspace."}
                    </p>
                    {profileMode === "manual" && skills && <p>{skills}</p>}
                  </div>
                </div>
                <div className={styles.continueNotice}>
                  <ShieldCheck size={19} aria-hidden="true" />
                  <p>
                    <strong>A preview of a broader career experience.</strong>{" "}
                    The current private workspace is for its existing owner,
                    with Software and Semiconductor profiles. These preview
                    preferences will not be saved to that account.
                  </p>
                </div>
                <div className={styles.endActions}>
                  <ButtonLink href="/login?next=%2Fapp">
                    Sign in to existing workspace{" "}
                    <ArrowRight size={17} aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink href="/preview" variant="secondary">
                    Explore the demo workspace
                  </ButtonLink>
                  <p>
                    The demo uses fictional examples. No private account is
                    created.
                  </p>
                </div>
              </div>
            )}
            <div className={styles.formFooter}>
              {step > 0 ? (
                <Button variant="ghost" onClick={() => changeStep(step - 1)}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  Back
                </Button>
              ) : (
                <ButtonLink href="/" variant="ghost">
                  <ArrowLeft size={16} aria-hidden="true" />
                  Home
                </ButtonLink>
              )}
              {step < 3 && (
                <Button type="submit">
                  {step === 2 ? "Review my choices" : "Continue"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              )}
            </div>
          </form>
        </section>
        <aside
          className={styles.contextPanel}
          aria-label="Your career direction preview"
        >
          <p className={styles.contextEyebrow}>A little more focus.</p>
          <h2>
            A lot more
            <br />
            possibility.
          </h2>
          <div className={styles.careerMap} aria-hidden="true">
            <div className={styles.orbitOne} />
            <div className={styles.orbitTwo} />
            <div className={styles.core}>o</div>
            <div className={styles.mapRole}>
              <span>
                <Sparkles size={15} />
                Your next role
              </span>
              <strong>{roles[0] || "Something that fits."}</strong>
              <small>{industry}</small>
            </div>
            <div className={styles.mapLocation}>
              <MapPin size={16} />
              <span>
                {workModes.join(" / ") || "Your preferred way to work"}
              </span>
            </div>
            <div className={styles.mapResume}>
              <FileText size={22} />
              <span>{resume ? "Your experience" : "Your story"}</span>
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className={styles.contextBottom}>
            <span>{String(step + 1).padStart(2, "0")} / 04</span>
            <p>
              Find your direction.
              <br />
              Keep the decisions yours.
            </p>
          </div>
        </aside>
      </main>
      <footer className={styles.pageFooter}>
        <span>opporbyte · Thoughtfully organized opportunities.</span>
        <span>Frontend preview. Nothing is submitted.</span>
      </footer>
    </div>
  );
}
