"use client";
import { useState } from "react";
import { FileText, CheckCircle2, Download, Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  Field,
  PageHeading,
  Tabs,
} from "@/components/ui";
import { json, query, request } from "./api";
import { demoJobs, demoState, demoDate } from "./demo";
import {
  ActionNotice,
  date,
  LoadState,
  useAction,
  useResource,
} from "./common";
import type { CandidateFact, Job, ResumeExport, ResumeVersion } from "./types";
import type { ViewProps } from "./WorkspacePage";
import styles from "./Workspace.module.css";
function download(content: string, type: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Resumes({ demo, profile }: ViewProps) {
  const resource = useResource(async () => {
    if (demo)
      return {
        resumes: [...demoState.resumes],
        facts: [...demoState.facts],
        jobs: demoJobs,
      };
    const [resumes, facts, jobs] = await Promise.all([
      request<ResumeVersion[]>(`/resumes${query({ profile_type: profile })}`),
      request<CandidateFact[]>("/facts"),
      request<Job[]>("/jobs?limit=200"),
    ]);
    return { resumes, facts, jobs };
  }, [demo, profile]);
  const action = useAction();
  const [tab, setTab] = useState("versions");
  const [selected, setSelected] = useState<ResumeVersion | null>(null);
  const [factOpen, setFactOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("skill");
  const [jobId, setJobId] = useState("");
  const [name, setName] = useState("");
  const [previewLayout, setPreviewLayout] = useState("editorial");
  const [masterText, setMasterText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const data = resource.data;
  const exportVersion = (resume: ResumeVersion, format: "txt" | "html") =>
    action.run(
      async () => {
        let result: ResumeExport;
        if (demo) {
          const text = [
            resume.version_name,
            resume.summary,
            ...resume.selected_facts.map(
              (f) => `${f.section}: ${f.bullet_text}`,
            ),
          ].join("\n\n");
          result = {
            resume_id: resume.id,
            version_name: resume.version_name,
            plain_text: `FICTIONAL WORKSPACE PREVIEW\n\n${text}`,
            html_content: `<!doctype html><html lang="en"><meta charset="utf-8"><title>Fictional resume preview</title><body><h1>Fictional resume preview</h1><p>${text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char).replaceAll("\n", "<br>")}</p></body></html>`,
          };
        } else
          result = await request<ResumeExport>(
            `/resumes/${encodeURIComponent(resume.id)}/export`,
          );
        download(
          format === "txt" ? result.plain_text : result.html_content,
          format === "txt" ? "text/plain" : "text/html",
          `${resume.version_name.replace(/[^a-z0-9_-]/gi, "-")}.${format}`,
        );
      },
      demo ? "Fictional example exported." : "Resume export downloaded.",
    );
  return (
    <>
      <PageHeading
        title="Your experience. Thoughtfully presented."
        action={
          <Button variant="secondary" onClick={() => setFactOpen(true)}>
            <Plus size={17} /> Add a fact
          </Button>
        }
      >
        Prepare a role-specific version from information you’ve reviewed.
      </PageHeading>
      <Tabs
        label="Resume studio view"
        value={tab}
        onChange={setTab}
        items={[
          { value: "versions", label: "Resume versions" },
          { value: "facts", label: "Facts & verification" },
        ]}
      />
      <ActionNotice {...action} />
      <LoadState
        loading={resource.loading}
        error={resource.error}
        retry={resource.refresh}
      />
      {data && (
        <>
          {tab === "versions" ? (
            <>
              <Card className={styles.tailorForm}>
                <div>
                  <Badge tone="cyan">
                    <CheckCircle2 size={14} />
                    {data.facts.filter((f) => f.verified).length} verified facts
                  </Badge>
                  <h2>Prepare for a specific role.</h2>
                  <p>
                    Tailoring selects relevant verified facts. Review the
                    finished version before applying.
                  </p>
                </div>
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    action.run(
                      async () => {
                        if (demo) {
                          const job = data.jobs.find((j) => j.id === jobId);
                          if (!job) throw new Error("Select an example role.");
                          const facts = demoState.facts.filter(
                            (f) => f.verified,
                          );
                          if (!facts.length)
                            throw new Error(
                              "Verify at least one fact before preparing a resume.",
                            );
                          demoState.resumes.push({
                            id: `resume-${Date.now()}`,
                            profile_id: profile,
                            job_id: job.id,
                            version_name:
                              name.trim() || `${job.title} · ${job.company}`,
                            summary:
                              "Illustrative tailored resume prepared from your verified preview facts.",
                            selected_facts: facts.map((f) => ({
                              section:
                                f.category === "skill"
                                  ? "Skills"
                                  : "Experience",
                              fact_id: f.id,
                              title: f.title,
                              category: f.category,
                              bullet_text: f.description,
                              source_fact_ids: [f.id],
                              relevance_score: 90,
                            })),
                            is_master: false,
                            created_at: demoDate,
                            job_title: job.title,
                            job_company: job.company,
                          });
                        } else
                          await request(
                            "/resumes/tailor",
                            json("POST", {
                              profile_type: profile,
                              job_id: jobId,
                              version_name: name.trim() || undefined,
                            }),
                          );
                        resource.refresh();
                      },
                      demo
                        ? "Example version prepared in your preview."
                        : "Tailored resume prepared. Review the version below.",
                    );
                  }}
                >
                  <Field label="Target opportunity" htmlFor="resume-job">
                    <select
                      required
                      id="resume-job"
                      value={jobId}
                      onChange={(e) => setJobId(e.target.value)}
                    >
                      <option value="">Choose a role</option>
                      {data.jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} · {job.company}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Version name (optional)" htmlFor="resume-name">
                    <input
                      id="resume-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Role · Company"
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={action.busy || !data.jobs.length}
                  >
                    {action.busy ? "Preparing…" : "Prepare tailored resume"}
                  </Button>
                </form>
              </Card>
              <div className={styles.sectionHead}>
                <h2>Your resume library</h2>
                <span>{data.resumes.length} versions</span>
              </div>
              <div className={styles.resumeGrid}>
                {data.resumes.map((resume) => (
                  <Card key={resume.id} className={styles.resumeCard}>
                    <div className={styles.resumeThumbnail}>
                      <FileText size={23} />
                      <span />
                      <span />
                      <span className={styles.highlightLine} />
                      <span />
                      <span />
                    </div>
                    <Badge tone={resume.is_master ? "neutral" : "cyan"}>
                      {resume.is_master ? "Master version" : "Role-tailored"}
                    </Badge>
                    <h3>{resume.version_name}</h3>
                    <p>
                      {resume.job_company || "General profile"} ·{" "}
                      {date(resume.created_at)}
                    </p>
                    <div className={styles.resumeMeta}>
                      <span>{resume.selected_facts.length} selected facts</span>
                      {resume.ats_score != null && (
                        <span>{resume.ats_score} ATS score</span>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelected(resume);
                        setConfirmDelete(false);
                      }}
                    >
                      Review version
                    </Button>
                  </Card>
                ))}
              </div>
              {!data.resumes.length && (
                <EmptyState title="A stronger application starts with your facts">
                  Verify your experience, select an opportunity, and prepare
                  your first tailored version.
                </EmptyState>
              )}
            </>
          ) : (
            <>
              <Card>
                <div className={styles.sectionHead}>
                  <div>
                    <h2>Start with what’s true.</h2>
                    <p className={styles.muted}>
                      Only facts you verify should support your applications.
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => setFactOpen(true)}>
                    Add a fact
                  </Button>
                </div>
                <div className={styles.factList}>
                  {data.facts.map((fact) => (
                    <div key={fact.id} className={styles.fact}>
                      <div>
                        <Badge tone={fact.verified ? "cyan" : "orange"}>
                          {fact.verified ? "Verified" : "Needs review"}
                        </Badge>
                        <small>
                          {fact.category} · {fact.source}
                        </small>
                        <h3>{fact.title}</h3>
                        <p>{fact.description}</p>
                      </div>
                      <Button
                        variant="secondary"
                        disabled={action.busy}
                        onClick={() =>
                          action.run(
                            async () => {
                              if (demo)
                                demoState.facts = demoState.facts.map((f) =>
                                  f.id === fact.id
                                    ? { ...f, verified: !f.verified }
                                    : f,
                                );
                              else
                                await request(
                                  `/facts/${encodeURIComponent(fact.id)}`,
                                  json("PUT", { verified: !fact.verified }),
                                );
                              resource.refresh();
                            },
                            fact.verified
                              ? "Fact marked for review."
                              : "Fact verified.",
                          )
                        }
                      >
                        {fact.verified ? "Mark for review" : "Verify fact"}
                      </Button>
                    </div>
                  ))}
                </div>
                {!data.facts.length && (
                  <EmptyState title="Build a trusted foundation">
                    Add experience, projects, skills, and qualifications you can
                    substantiate.
                  </EmptyState>
                )}
              </Card>
              <Card>
                <h2>Review facts from your resume text</h2>
                <p>
                  Paste information you want to review. Extraction creates
                  candidate facts for human verification; it does not upload a
                  file.
                </p>
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    action.run(
                      async () => {
                        if (demo) {
                          action.setMessage(
                            "Preview only. Add and verify individual example facts above; no extraction service was called.",
                          );
                          return;
                        }
                        await request(
                          "/facts/extract",
                          json("POST", {
                            text_content: masterText,
                            source: "master_resume",
                          }),
                        );
                        setMasterText("");
                        resource.refresh();
                      },
                      demo
                        ? undefined
                        : "Candidate facts extracted. Review each fact before verification.",
                    );
                  }}
                >
                  <Field label="Resume text" htmlFor="resume-source">
                    <textarea
                      id="resume-source"
                      required
                      minLength={20}
                      rows={5}
                      value={masterText}
                      onChange={(e) => setMasterText(e.target.value)}
                      placeholder="Paste your resume text for review"
                    />
                  </Field>
                  <Button type="submit" disabled={action.busy}>
                    {demo
                      ? "Try extraction preview"
                      : "Extract facts for review"}
                  </Button>
                </form>
                {!demo && (
                  <Button
                    variant="ghost"
                    disabled={action.busy}
                    onClick={() =>
                      action.run(async () => {
                        await request("/facts/seed", json("POST", {}));
                        resource.refresh();
                      }, "Curated starter facts loaded. Review these examples before treating them as your experience.")
                    }
                  >
                    Load curated starter facts
                  </Button>
                )}
              </Card>
            </>
          )}
        </>
      )}
      <Drawer
        open={factOpen}
        onClose={() => setFactOpen(false)}
        title="Add a verifiable fact"
      >
        <p>
          Record one specific piece of experience. You can verify it after
          reviewing the information.
        </p>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            action.run(async () => {
              const input = {
                category,
                title: title.trim(),
                description: description.trim(),
                verified: false,
                source: "manual",
              };
              if (demo)
                demoState.facts.push({
                  ...input,
                  id: `fact-${Date.now()}`,
                  user_id: "demo",
                  category: category as CandidateFact["category"],
                  created_at: demoDate,
                });
              else await request("/facts", json("POST", input));
              setTitle("");
              setDescription("");
              setFactOpen(false);
              resource.refresh();
            }, "Fact added for review.");
          }}
        >
          <Field label="Category" htmlFor="fact-category">
            <select
              id="fact-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                "skill",
                "experience",
                "education",
                "project",
                "certification",
                "achievement",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Fact title" htmlFor="fact-title">
            <input
              id="fact-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Evidence and detail" htmlFor="fact-description">
            <textarea
              id="fact-description"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={action.busy}>
            Add for review
          </Button>
          <ActionNotice {...action} />
        </form>
      </Drawer>
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Review resume version"
      >
        {selected && (
          <>
            <Badge tone="cyan">
              {demo ? "Fictional preview" : "Tailored version"}
            </Badge>
            <Tabs
              label="Preview layout"
              value={previewLayout}
              onChange={setPreviewLayout}
              items={[
                { value: "editorial", label: "Editorial preview" },
                { value: "compact", label: "Compact preview" },
              ]}
            />
            <p className={styles.finePrint}>
              Layout selection changes this preview. Downloads use the backend’s
              text or print-ready HTML format.
            </p>
            <div
              className={`${styles.document} ${previewLayout === "compact" ? styles.compactDocument : ""}`}
            >
              <h2>{selected.version_name}</h2>
              <p>{selected.summary}</p>
              {selected.selected_facts.map((fact, index) => (
                <div key={`${fact.fact_id}-${index}`}>
                  <h3>{fact.section}</h3>
                  <p>{fact.bullet_text}</p>
                  <small>Source fact: {fact.title || fact.fact_id}</small>
                </div>
              ))}
            </div>
            <h3>Compared with your source facts</h3>
            <p>
              {selected.selected_facts.length} facts selected for this role.
              Review wording and evidence against the facts in your library; a
              fit score is not an employer guarantee.
            </p>
            <div className={styles.drawerActions}>
              <Button
                variant="secondary"
                disabled={action.busy}
                onClick={() => exportVersion(selected, "txt")}
              >
                <Download size={16} /> Text
              </Button>
              <Button
                variant="secondary"
                disabled={action.busy}
                onClick={() => exportVersion(selected, "html")}
              >
                <Download size={16} /> HTML
              </Button>
              {selected.job_id && (
                <Button
                  disabled={action.busy}
                  onClick={() =>
                    action.run(async () => {
                      if (demo) {
                        if (
                          demoState.applications.some(
                            (a) => a.job_id === selected.job_id,
                          )
                        )
                          throw new Error(
                            "This role is already in the preview queue. Associate this resume from the application details.",
                          );
                        demoState.applications.push({
                          id: `application-${Date.now()}`,
                          user_id: "demo",
                          job_id: selected.job_id!,
                          profile_id: profile,
                          profile_type: profile,
                          resume_version_id: selected.id,
                          resume_name: selected.version_name,
                          status: "ready_for_review",
                          submission_method: "manual",
                          job_title: selected.job_title,
                          job_company: selected.job_company,
                          created_at: demoDate,
                          updated_at: demoDate,
                        });
                      } else
                        await request(
                          "/applications",
                          json("POST", {
                            profile_type: profile,
                            job_id: selected.job_id,
                            resume_version_id: selected.id,
                            submission_method: "manual",
                          }),
                        );
                    }, "Resume associated with a review package. No submission was sent.")
                  }
                >
                  Stage application
                </Button>
              )}
            </div>
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              Delete this version
            </Button>
            {confirmDelete && (
              <div className={styles.deleteConfirmation}>
                <p>Delete this resume version? This cannot be undone.</p>
                <Button
                  variant="danger"
                  disabled={action.busy}
                  onClick={() =>
                    action.run(async () => {
                      if (demo)
                        demoState.resumes = demoState.resumes.filter(
                          (r) => r.id !== selected.id,
                        );
                      else
                        await request(
                          `/resumes/${encodeURIComponent(selected.id)}`,
                          { method: "DELETE" },
                        );
                      setSelected(null);
                      resource.refresh();
                    }, "Resume version deleted.")
                  }
                >
                  Confirm delete
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Keep version
                </Button>
              </div>
            )}
            <ActionNotice {...action} />
          </>
        )}
      </Drawer>
    </>
  );
}
