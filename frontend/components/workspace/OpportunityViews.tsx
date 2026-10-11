"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Field,
  PageHeading,
} from "@/components/ui";
import { getMe, json, query, request } from "./api";
import { demoJobs, demoMatches, demoState, demoDate } from "./demo";
import {
  ActionNotice,
  date,
  human,
  JobCard,
  LoadState,
  safeEmployerUrl,
  useAction,
  useResource,
} from "./common";
import type { Application, Job, JobMatch, ResumeVersion, User } from "./types";
import type { ViewProps } from "./WorkspacePage";
import styles from "./Workspace.module.css";
import SourceSyncPanel from "./SourceSyncPanel";
async function stageJob(job: Job, profile: string, demo: boolean) {
  if (demo) {
    if (demoState.applications.some((a) => a.job_id === job.id))
      throw new Error("This example role is already in your preview queue.");
    demoState.applications.push({
      id: `demo-${Date.now()}`,
      user_id: "demo",
      job_id: job.id,
      profile_id: profile,
      profile_type: profile as "software" | "semiconductor",
      status: "ready_for_review",
      submission_method: "manual",
      job_title: job.title,
      job_company: job.company,
      job_location: job.location,
      created_at: demoDate,
      updated_at: demoDate,
    });
    return;
  }
  await request(
    "/applications",
    json("POST", {
      profile_type: profile,
      job_id: job.id,
      submission_method: "manual",
    }),
  );
}
export function Dashboard({ demo, profile, base }: ViewProps) {
  const resource = useResource(async () => {
    if (demo)
      return {
        user: { full_name: "Alex", email: "alex@example.test" } as User,
        jobs: demoJobs,
        matches: demoMatches,
        applications: demoState.applications,
        resumes: demoState.resumes,
      };
    const [user, jobs, matches, applications, resumes] = await Promise.all([
      getMe(),
      request<Job[]>("/jobs?limit=50"),
      request<JobMatch[]>(
        `/matches${query({ profile_type: profile, min_score: 0 })}`,
      ),
      request<Application[]>("/applications"),
      request<ResumeVersion[]>(`/resumes${query({ profile_type: profile })}`),
    ]);
    return { user, jobs, matches, applications, resumes };
  }, [demo, profile]);
  const data = resource.data;
  const metrics = [
    [
      "New opportunities",
      data?.jobs.length || 0,
      "Ready to explore",
      "/discover",
    ],
    [
      "Strong matches",
      data?.matches.filter((m) => m.classification === "strong").length || 0,
      "Aligned with your profile",
      "/discover",
    ],
    [
      "Prepared applications",
      data?.applications.filter((a) =>
        ["ready_for_review", "approved"].includes(a.status),
      ).length || 0,
      "Waiting for your review",
      "/applications",
    ],
    [
      "Submitted",
      data?.applications.filter((a) => a.status === "submitted").length || 0,
      "Recorded by you",
      "/applications",
    ],
  ];
  return (
    <>
      <PageHeading
        title={`Welcome${data?.user.full_name ? `, ${data.user.full_name.split(" ")[0]}` : ""}. Let’s move forward.`}
        action={
          <ButtonLink href={`${base}/discover`}>
            Discover opportunities <ArrowUpRight size={17} />
          </ButtonLink>
        }
      >
        A clearer view of your next move, one thoughtful decision at a time.
      </PageHeading>
      <LoadState
        loading={resource.loading}
        error={resource.error}
        retry={resource.refresh}
      />
      {data && (
        <>
          <div className={styles.metrics}>
            {metrics.map(([label, value, caption, href]) => (
              <Link
                className={styles.metric}
                key={label}
                href={`${base}${href}`}
              >
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{caption}</small>
              </Link>
            ))}
          </div>
          <div className={styles.dashboardGrid}>
            <section>
              <div className={styles.sectionHead}>
                <h2>Opportunities worth a look</h2>
                <Link href={`${base}/discover`}>
                  View all <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className={styles.jobGrid}>
                {data.jobs.slice(0, 4).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    match={data.matches.find((m) => m.job_id === job.id)}
                    base={base}
                  />
                ))}
              </div>
              {!data.jobs.length && (
                <EmptyState
                  title="Your next opportunity starts here"
                  action={
                    <ButtonLink href={`${base}/discover`}>Find jobs</ButtonLink>
                  }
                >
                  Explore a supported job board and review roles against your
                  career profile.
                </EmptyState>
              )}
            </section>
            <aside>
              <Card className={styles.focusCard}>
                <Badge tone="cyan">
                  <ShieldCheck size={14} /> Your focus
                </Badge>
                <h2>
                  Prepared.
                  <br />
                  Never rushed.
                </h2>
                <p>
                  Review your verified facts and role requirements before every
                  application.
                </p>
                <ButtonLink href={`${base}/resumes`} variant="primary">
                  Visit resume studio
                </ButtonLink>
              </Card>
              <div className={styles.sectionHead}>
                <h2>Recent activity</h2>
              </div>
              <div className={styles.activity}>
                {data.applications.slice(0, 4).map((a) => (
                  <div key={a.id}>
                    <span className={styles.activityDot} />
                    <div>
                      <strong>{a.job_title || "Application"}</strong>
                      <p>
                        {human(a.status)} · {date(a.updated_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {!data.applications.length && (
                  <p>
                    No application activity yet. Saved roles will appear in your
                    queue.
                  </p>
                )}
              </div>
            </aside>
          </div>
          <div className={styles.quickActions}>
            <Link href={`${base}/profiles`}>
              <Check size={18} /> Refine career preferences
            </Link>
            <Link href={`${base}/resumes`}>
              <FileText size={18} /> Verify resume facts
            </Link>
            <Link href={`${base}/applications`}>
              <ShieldCheck size={18} /> Review your queue
            </Link>
          </div>
        </>
      )}
    </>
  );
}
export function Discover({ demo, profile, base }: ViewProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [work, setWork] = useState("");
  const [layout, setLayout] = useState("cards");
  const [boardOpen, setBoardOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>(
    demo ? demoState.applications.map((a) => a.job_id) : [],
  );
  const action = useAction();
  const resource = useResource(async () => {
    if (demo)
      return {
        jobs: demoJobs,
        matches: demoMatches,
        applications: demoState.applications,
      };
    const [jobs, matches, applications] = await Promise.all([
      request<Job[]>(`/jobs${query({ limit: 200, profile_type: profile })}`),
      request<JobMatch[]>(
        `/matches${query({ profile_type: profile, min_score: 0 })}`,
      ),
      request<Application[]>("/applications"),
    ]);
    return { jobs, matches, applications };
  }, [demo, profile]);
  const jobs =
    resource.data?.jobs.filter(
      (job) =>
        (!search ||
          `${job.title} ${job.company} ${job.description}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!location ||
          job.location.toLowerCase().includes(location.toLowerCase())) &&
        (!work || job.work_mode === work),
    ) || [];
  const save = (job: Job) =>
    action.run(
      async () => {
        await stageJob(job, profile, demo);
        setSaved((v) => [...v, job.id]);
      },
      demo
        ? "Example role saved to the preview queue."
        : "Role saved to your application review queue.",
    );
  return (
    <>
      <PageHeading
        title="Find your next opportunity."
        action={
          <Button variant="secondary" onClick={() => setBoardOpen(true)}>
            Connect a job board
          </Button>
        }
      >
        Discover, compare, and give the right roles your attention.
      </PageHeading>
      <Card className={styles.filterCard}>
        <Field label="Search roles or companies" htmlFor="job-search">
          <div className={styles.searchInput}>
            <Search size={18} />
            <input
              id="job-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Role, company or skill"
            />
          </div>
        </Field>
        <Field label="Location" htmlFor="job-location">
          <input
            id="job-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or remote"
          />
        </Field>
        <Field label="Work type" htmlFor="job-work">
          <select
            id="job-work"
            value={work}
            onChange={(e) => setWork(e.target.value)}
          >
            <option value="">All work types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="on-site">On-site</option>
          </select>
        </Field>
      </Card>
      <SourceSyncPanel
        demo={demo}
        profile={profile}
        open={boardOpen}
        onClose={() => setBoardOpen(false)}
        onComplete={resource.refresh}
      />
      <ActionNotice {...action} />
      <LoadState
        loading={resource.loading}
        error={resource.error}
        retry={resource.refresh}
      />
      {resource.data && (
        <>
          <div className={styles.sectionHead}>
            <h2>
              {jobs.length}{" "}
              {jobs.length === 1 ? "opportunity" : "opportunities"}
            </h2>
            <div
              className={styles.viewSwitcher}
              role="group"
              aria-label="Job layout"
            >
              <button
                type="button"
                aria-pressed={layout === "cards"}
                onClick={() => setLayout("cards")}
              >
                Cards
              </button>
              <button
                type="button"
                aria-pressed={layout === "list"}
                onClick={() => setLayout("list")}
              >
                List
              </button>
            </div>
          </div>
          <div className={layout === "cards" ? styles.jobGrid : styles.jobList}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                match={resource.data?.matches.find((m) => m.job_id === job.id)}
                base={base}
                onSave={save}
                saved={
                  saved.includes(job.id) ||
                  resource.data?.applications.some((a) => a.job_id === job.id)
                }
              />
            ))}
          </div>
          {!jobs.length && (
            <EmptyState
              title="No roles match these filters"
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setLocation("");
                    setWork("");
                  }}
                >
                  Clear filters
                </Button>
              }
            >
              Try a broader role or location, or connect a supported employer
              job board.
            </EmptyState>
          )}
          <p className={styles.finePrint}>
            Saving creates a package for your review. It does not contact an
            employer or submit an application.
          </p>
        </>
      )}
    </>
  );
}
export function JobDetail({
  demo,
  profile,
  base,
  jobId,
}: ViewProps & { jobId: string }) {
  const action = useAction();
  const resource = useResource(async () => {
    if (demo) {
      const job = demoJobs.find((j) => j.id === jobId);
      if (!job)
        throw new Error(
          "This example role was not found. Return to Discover jobs.",
        );
      return { job, matches: demoMatches };
    }
    const [job, matches] = await Promise.all([
      request<Job>(`/jobs/${encodeURIComponent(jobId)}`),
      request<JobMatch[]>(
        `/matches${query({ profile_type: profile, min_score: 0 })}`,
      ),
    ]);
    return { job, matches };
  }, [demo, profile, jobId]);
  const data = resource.data;
  const match = data?.matches.find((m) => m.job_id === jobId);
  const url = data ? safeEmployerUrl(data.job.url) : null;
  return (
    <>
      <Link className={styles.backLink} href={`${base}/discover`}>
        ← All opportunities
      </Link>
      <LoadState
        loading={resource.loading}
        error={resource.error}
        retry={resource.refresh}
      />
      {data && (
        <>
          <PageHeading
            title={data.job.title}
            action={
              url ? (
                <a
                  className="ui-button ui-button-primary"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Employer application <ArrowUpRight size={17} />
                </a>
              ) : (
                <Badge>
                  {demo
                    ? "Fictional example role"
                    : "No official application link"}
                </Badge>
              )
            }
          >
            {data.job.company} · {data.job.location} ·{" "}
            {human(data.job.work_mode)}
          </PageHeading>
          <ActionNotice {...action} />
          <div className={styles.detailGrid}>
            <Card className={styles.descriptionCard}>
              <Badge>{human(data.job.employment_type)}</Badge>
              <h2>About this opportunity</h2>
              <p className={styles.longDescription}>{data.job.description}</p>
              <p className={styles.finePrint}>
                Always verify current requirements and availability on the
                employer’s official website.
              </p>
            </Card>
            <aside className={styles.detailAside}>
              <Card>
                <div className={styles.matchHeader}>
                  <span>Your match</span>
                  <strong>
                    {match ? `${match.overall_score}%` : "Not evaluated"}
                  </strong>
                </div>
                {match ? (
                  <>
                    <Badge tone="cyan">{human(match.classification)} fit</Badge>
                    <p>{match.match_evidence.explanation}</p>
                    <Badge
                      tone={
                        match.match_evidence.eligibility.eligible
                          ? "cyan"
                          : "orange"
                      }
                    >
                      {match.match_evidence.eligibility.eligible
                        ? "Eligibility checks passed"
                        : "Eligibility needs attention"}
                    </Badge>
                    <div className={styles.scoreBreakdown}>
                      <span>
                        Required skills{" "}
                        <strong>{match.required_skills_score}%</strong>
                      </span>
                      <span>
                        Experience <strong>{match.experience_score}%</strong>
                      </span>
                      <span>
                        Role alignment <strong>{match.alignment_score}%</strong>
                      </span>
                      <span>
                        Preferences <strong>{match.preferences_score}%</strong>
                      </span>
                    </div>
                    <h3>Skills in alignment</h3>
                    <div className={styles.chips}>
                      {match.match_evidence.matched_skills.map((skill) => (
                        <Badge tone="cyan" key={skill}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <h3>Requirements to review</h3>
                    {match.match_evidence.missing_critical_skills.length ? (
                      <div className={styles.chips}>
                        {match.match_evidence.missing_critical_skills.map(
                          (skill) => (
                            <Badge tone="orange" key={skill}>
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    ) : (
                      <p>No critical skills gaps were recorded.</p>
                    )}
                    {match.match_evidence.eligibility.requires_human_review && (
                      <p className={styles.notice}>
                        Human review needed:{" "}
                        {match.match_evidence.eligibility.review_reasons.join(
                          " ",
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p>
                      Evaluate this profile against discovered jobs to see
                      recorded skill alignment and eligibility evidence.
                    </p>
                    <Button
                      variant="secondary"
                      disabled={action.busy}
                      onClick={() =>
                        action.run(
                          async () => {
                            if (!demo)
                              await request(
                                "/matches/evaluate",
                                json("POST", { profile_type: profile }),
                              );
                            resource.refresh();
                          },
                          demo
                            ? "Preview evaluation shown. No AI task executed."
                            : "Matching completed. Results refreshed.",
                        )
                      }
                    >
                      Evaluate matches
                    </Button>
                  </>
                )}
              </Card>
              <Card>
                <FileText size={24} />
                <h3>Prepare with confidence.</h3>
                <p>Tailor a resume using facts you’ve reviewed and verified.</p>
                <Button
                  disabled={action.busy}
                  onClick={() =>
                    action.run(
                      async () => {
                        if (demo) {
                          const template = demoState.resumes[0];
                          if (!template)
                            throw new Error(
                              "Add verified facts in Resume studio first.",
                            );
                          demoState.resumes.push({
                            ...template,
                            id: `resume-${Date.now()}`,
                            job_id: data.job.id,
                            job_title: data.job.title,
                            job_company: data.job.company,
                            version_name: `${data.job.title} · ${data.job.company}`,
                          });
                        } else
                          await request(
                            "/resumes/tailor",
                            json("POST", {
                              profile_type: profile,
                              job_id: data.job.id,
                              version_name: `${data.job.title} · ${data.job.company}`,
                            }),
                          );
                      },
                      demo
                        ? "Example resume prepared in the preview."
                        : "Resume prepared. Open Resume studio to review it.",
                    )
                  }
                >
                  Prepare a tailored resume
                </Button>
                <ButtonLink href={`${base}/resumes`} variant="ghost">
                  Open resume studio
                </ButtonLink>
                <Button
                  variant="secondary"
                  disabled={action.busy}
                  onClick={() =>
                    action.run(
                      async () => {
                        await stageJob(data.job, profile, demo);
                      },
                      demo
                        ? "Example saved to your preview queue."
                        : "Package saved to your application review queue.",
                    )
                  }
                >
                  Save to application queue
                </Button>
              </Card>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
