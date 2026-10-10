"use client";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Plus, ShieldCheck } from "lucide-react";
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
  human,
  LoadState,
  safeEmployerUrl,
  useAction,
  useResource,
} from "./common";
import type {
  Application,
  ApplicationStatus,
  Job,
  ResumeVersion,
} from "./types";
import type { ViewProps } from "./WorkspacePage";
import styles from "./Workspace.module.css";
const statuses: ApplicationStatus[] = [
  "draft",
  "ready_for_review",
  "approved",
  "submitted",
  "interviewing",
  "offer",
  "rejected",
];
export default function Applications({ demo, profile }: ViewProps) {
  const resource = useResource(async () => {
    if (demo)
      return {
        applications: [...demoState.applications],
        resumes: [...demoState.resumes],
        jobs: demoJobs,
      };
    const [applications, resumes, jobs] = await Promise.all([
      request<Application[]>(
        `/applications${query({ profile_type: profile })}`,
      ),
      request<ResumeVersion[]>(`/resumes${query({ profile_type: profile })}`),
      request<Job[]>("/jobs?limit=200"),
    ]);
    return { applications, resumes, jobs };
  }, [demo, profile]);
  const action = useAction();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [resume, setResume] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("draft");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [submittedConfirm, setSubmittedConfirm] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newJob, setNewJob] = useState("");
  const [newResume, setNewResume] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const data = resource.data;
  const list =
    data?.applications.filter((a) => filter === "all" || a.status === filter) ||
    [];
  async function update(
    patch: Partial<Pick<Application, "status" | "notes">> & {
      resume_version_id?: string | null;
    },
  ) {
    if (!selected) return;
    let result: Application;
    if (demo) {
      result = {
        ...selected,
        ...patch,
        resume_version_id:
          patch.resume_version_id === null
            ? undefined
            : (patch.resume_version_id ?? selected.resume_version_id),
        updated_at: new Date().toISOString(),
      };
      const version = demoState.resumes.find(
        (r) => r.id === result.resume_version_id,
      );
      result.resume_name = version?.version_name;
      demoState.applications = demoState.applications.map((a) =>
        a.id === selected.id ? result : a,
      );
    } else
      result = await request<Application>(
        `/applications/${encodeURIComponent(selected.id)}`,
        json("PUT", patch),
      );
    setSelected(result);
    setStatus(result.status);
    setResume(result.resume_version_id || "");
    resource.refresh();
  }
  const selectedJob = data?.jobs.find((j) => j.id === selected?.job_id);
  const employerUrl = selectedJob ? safeEmployerUrl(selectedJob.url) : null;
  return (
    <>
      <PageHeading
        title="Every application, in view."
        action={
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            <Plus size={17} /> Stage an application
          </Button>
        }
      >
        A deliberate path from draft to review. You decide when to apply.
      </PageHeading>
      <div className={styles.queueIntro}>
        <ShieldCheck size={22} />
        <p>
          Approval prepares your package for the next step. Applications are
          submitted manually on employer websites, then recorded here.
        </p>
      </div>
      <Tabs
        label="Application status"
        value={filter}
        onChange={setFilter}
        items={[
          { value: "all", label: "All" },
          { value: "ready_for_review", label: "Needs review" },
          { value: "approved", label: "Approved" },
          { value: "submitted", label: "Submitted" },
          { value: "interviewing", label: "Interviewing" },
          { value: "rejected", label: "Rejected" },
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
          <div className={styles.sectionHead}>
            <h2>
              {list.length} {list.length === 1 ? "application" : "applications"}
            </h2>
            <span className={styles.muted}>
              {profile === "software" ? "Software" : "Semiconductor"} profile
            </span>
          </div>
          <div className={styles.applicationList}>
            {list.map((application) => (
              <Card key={application.id} className={styles.applicationRow}>
                <span className={styles.companyIcon} aria-hidden="true">
                  {(application.job_company || "O").slice(0, 1)}
                </span>
                <div className={styles.applicationRole}>
                  <h3>{application.job_title || "Untitled role"}</h3>
                  <p>
                    {application.job_company || "Company not recorded"} ·{" "}
                    {application.job_location || "Location not recorded"}
                  </p>
                  <small>
                    {application.resume_name || "No resume associated"} ·
                    Updated {date(application.updated_at)}
                  </small>
                </div>
                <Badge
                  tone={
                    application.status === "ready_for_review"
                      ? "orange"
                      : [
                            "approved",
                            "submitted",
                            "interviewing",
                            "offer",
                          ].includes(application.status)
                        ? "cyan"
                        : "neutral"
                  }
                >
                  {human(application.status)}
                </Badge>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelected(application);
                    setNotes(application.notes || "");
                    setResume(application.resume_version_id || "");
                    setStatus(application.status);
                    setDeleteConfirm(false);
                    setSubmittedConfirm(false);
                  }}
                >
                  Review details
                </Button>
              </Card>
            ))}
          </div>
          {!list.length && (
            <EmptyState
              title={
                filter === "all"
                  ? "Your queue is ready when you are."
                  : "Nothing in this stage yet."
              }
              action={
                <Button variant="secondary" onClick={() => setCreateOpen(true)}>
                  Stage a role
                </Button>
              }
            >
              Save an opportunity and associate a resume to begin a thoughtful
              application.
            </EmptyState>
          )}
        </>
      )}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Stage a new application"
      >
        <p>
          Create a package for your review queue. This does not send anything to
          an employer.
        </p>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            action.run(async () => {
              if (demo) {
                const job = demoJobs.find((j) => j.id === newJob);
                if (!job) throw new Error("Choose an opportunity.");
                if (demoState.applications.some((a) => a.job_id === newJob))
                  throw new Error("This role is already in the preview queue.");
                demoState.applications.push({
                  id: `application-${Date.now()}`,
                  user_id: "demo",
                  job_id: newJob,
                  profile_id: profile,
                  profile_type: profile,
                  resume_version_id: newResume || undefined,
                  status: "ready_for_review",
                  submission_method: "manual",
                  notes: newNotes,
                  created_at: demoDate,
                  updated_at: demoDate,
                  job_title: job.title,
                  job_company: job.company,
                  job_location: job.location,
                  resume_name: demoState.resumes.find((r) => r.id === newResume)
                    ?.version_name,
                });
              } else
                await request(
                  "/applications",
                  json("POST", {
                    profile_type: profile,
                    job_id: newJob,
                    resume_version_id: newResume || undefined,
                    notes: newNotes || undefined,
                    submission_method: "manual",
                  }),
                );
              setCreateOpen(false);
              setNewJob("");
              setNewResume("");
              setNewNotes("");
              resource.refresh();
            }, "Package staged for review. Nothing has been submitted.");
          }}
        >
          <Field label="Opportunity" htmlFor="application-job">
            <select
              required
              id="application-job"
              value={newJob}
              onChange={(e) => {
                setNewJob(e.target.value);
                setNewResume("");
              }}
            >
              <option value="">Choose a role</option>
              {data?.jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} · {job.company}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Resume version (optional)" htmlFor="application-resume">
            <select
              id="application-resume"
              value={newResume}
              onChange={(e) => setNewResume(e.target.value)}
            >
              <option value="">Associate later</option>
              {data?.resumes
                .filter((r) => !r.job_id || r.job_id === newJob)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.version_name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Notes" htmlFor="application-notes">
            <textarea
              id="application-notes"
              rows={4}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={action.busy}>
            Create review package
          </Button>
          <ActionNotice {...action} />
        </form>
      </Drawer>
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Application details"
      >
        {selected && (
          <>
            <Badge tone="cyan">{human(selected.status)}</Badge>
            <h2>{selected.job_title || "Application"}</h2>
            <p>
              {selected.job_company} · {selected.job_location}
            </p>
            <div className={styles.applicationHistory}>
              <div>
                <CheckCircle2 size={16} />
                <span>Created {date(selected.created_at)}</span>
              </div>
              <div>
                <CheckCircle2 size={16} />
                <span>Last updated {date(selected.updated_at)}</span>
              </div>
              {selected.submitted_at && (
                <div>
                  <CheckCircle2 size={16} />
                  <span>Submission recorded {date(selected.submitted_at)}</span>
                </div>
              )}
            </div>
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                if (status === "submitted" && selected.status !== "submitted") {
                  setSubmittedConfirm(true);
                  return;
                }
                action.run(
                  () =>
                    update({
                      notes,
                      resume_version_id: resume || null,
                      status,
                    }),
                  "Application details saved.",
                );
              }}
            >
              <Field label="Associated resume" htmlFor="detail-resume">
                <select
                  id="detail-resume"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                >
                  <option value="">No associated resume</option>
                  {data?.resumes
                    .filter((r) => !r.job_id || r.job_id === selected.job_id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.version_name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Status" htmlFor="detail-status">
                <select
                  id="detail-status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ApplicationStatus)
                  }
                >
                  {statuses.map((value) => (
                    <option key={value} value={value}>
                      {human(value)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Your notes" htmlFor="detail-notes">
                <textarea
                  id="detail-notes"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
              <Button type="submit" disabled={action.busy}>
                Save details
              </Button>
            </form>
            <div className={styles.drawerActions}>
              <Button
                disabled={action.busy || selected.status === "approved"}
                onClick={() =>
                  action.run(
                    () => update({ status: "approved" }),
                    "Package approved. Apply manually when you are ready.",
                  )
                }
              >
                Approve package
              </Button>
              <Button
                variant="secondary"
                disabled={action.busy || selected.status === "rejected"}
                onClick={() =>
                  action.run(
                    () => update({ status: "rejected" }),
                    "Application marked rejected.",
                  )
                }
              >
                Mark rejected
              </Button>
              {employerUrl && (
                <a
                  className="ui-button ui-button-secondary"
                  href={employerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer website <ArrowUpRight size={16} />
                </a>
              )}
            </div>
            {submittedConfirm && (
              <div className={styles.deleteConfirmation}>
                <h3>Have you submitted this application?</h3>
                <p>
                  This only records an application you already sent yourself. It
                  will not submit anything.
                </p>
                <Button
                  disabled={action.busy}
                  onClick={() =>
                    action.run(async () => {
                      await update({
                        notes,
                        resume_version_id: resume || null,
                        status: "submitted",
                      });
                      setSubmittedConfirm(false);
                    }, "Manual submission recorded.")
                  }
                >
                  Yes, record my submission
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSubmittedConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
            <Button variant="ghost" onClick={() => setDeleteConfirm(true)}>
              Delete application record
            </Button>
            {deleteConfirm && (
              <div className={styles.deleteConfirmation}>
                <p>
                  Delete this record? This cannot be undone and does not
                  withdraw an application from an employer.
                </p>
                <Button
                  variant="danger"
                  disabled={action.busy}
                  onClick={() =>
                    action.run(async () => {
                      if (demo)
                        demoState.applications = demoState.applications.filter(
                          (a) => a.id !== selected.id,
                        );
                      else
                        await request(
                          `/applications/${encodeURIComponent(selected.id)}`,
                          { method: "DELETE" },
                        );
                      setSelected(null);
                      resource.refresh();
                    }, "Application record deleted.")
                  }
                >
                  Confirm delete
                </Button>
                <Button variant="ghost" onClick={() => setDeleteConfirm(false)}>
                  Keep record
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
