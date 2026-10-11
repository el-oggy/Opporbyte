"use client";
import Link from "next/link";
import { Check, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Badge, Button, Card, EmptyState, PageHeading } from "@/components/ui";
import { getMe, query, request } from "./api";
import { demoJobs, demoMatches, demoState } from "./demo";
import {
  date,
  human,
  LoadState,
  useAction,
  ActionNotice,
  useResource,
} from "./common";
import { useWorkspacePreferences } from "./preferences";
import type { AnalyticsSummary, User } from "./types";
import type { ViewProps } from "./WorkspacePage";
import styles from "./Workspace.module.css";
export function Analytics({ demo, profile }: ViewProps) {
  const resource = useResource(async () => {
    if (!demo)
      return request<AnalyticsSummary>(
        `/analytics/summary${query({ profile_type: profile })}`,
      );
    const pipeline: Record<string, number> = {};
    demoState.applications.forEach((a) => {
      pipeline[a.status] = (pipeline[a.status] || 0) + 1;
    });
    return {
      total_jobs: demoJobs.length,
      source_distribution: { "Fictional examples": demoJobs.length },
      profile_type: profile,
      total_matches: demoMatches.length,
      strong_matches: demoMatches.filter((m) => m.classification === "strong")
        .length,
      potential_matches: demoMatches.filter(
        (m) => m.classification === "potential",
      ).length,
      low_matches: demoMatches.filter((m) => m.classification === "low").length,
      average_match_score: Math.round(
        demoMatches.reduce((sum, m) => sum + m.overall_score, 0) /
          demoMatches.length,
      ),
      total_resumes: demoState.resumes.length,
      average_ats_score: 86,
      application_pipeline: pipeline,
      recent_tasks: [],
    };
  }, [demo, profile]);
  const data = resource.data;
  const total = data
    ? Object.entries(data.application_pipeline)
        .filter(([status]) => status !== "total")
        .reduce((sum, [, count]) => sum + count, 0)
    : 0;
  return (
    <>
      <PageHeading title="See your search more clearly.">
        Useful signals from your recorded activity. Progress without the noise.
      </PageHeading>
      <LoadState
        loading={resource.loading}
        error={resource.error}
        retry={resource.refresh}
      />
      {data && (
        <>
          <div className={styles.metrics}>
            {[
              ["Discovered roles", data.total_jobs],
              ["Evaluated matches", data.total_matches],
              ["Resume versions", data.total_resumes],
              ["Applications", total],
            ].map(([label, value]) => (
              <div key={label} className={styles.metric}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>
                  {demo ? "Fictional preview data" : "Recorded workspace data"}
                </small>
              </div>
            ))}
          </div>
          <div className={styles.reportingGrid}>
            <Card>
              <div className={styles.sectionHead}>
                <h2>Your application pipeline</h2>
                <Badge>{total} total</Badge>
              </div>
              {total ? (
                <div className={styles.barChart}>
                  {Object.entries(data.application_pipeline)
                    .filter(([status]) => status !== "total")
                    .map(([status, count]) => (
                      <div key={status}>
                        <span>{human(status)}</span>
                        <div>
                          <i
                            style={{
                              width: `${(count / Math.max(total, 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                </div>
              ) : (
                <EmptyState title="Your story starts with the first role">
                  Stage an application to see your pipeline here.
                </EmptyState>
              )}
            </Card>
            <Card>
              <h2>Match quality</h2>
              <p className={styles.muted}>
                {profile === "software" ? "Software" : "Semiconductor"} profile
              </p>
              <div className={styles.matchQuality}>
                {[
                  ["Strong", data.strong_matches],
                  ["Potential", data.potential_matches],
                  ["Low", data.low_matches],
                ].map(([label, count]) => (
                  <div key={label}>
                    <strong>{count}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p className={styles.finePrint}>
                {data.total_matches
                  ? `${data.average_match_score}% average recorded match score. Scores support your review; they do not predict hiring outcomes.`
                  : "Evaluate discovered jobs to see recorded match quality."}
              </p>
            </Card>
            <Card>
              <h2>Where opportunities come from</h2>
              <div className={styles.sourceList}>
                {Object.entries(data.source_distribution).map(
                  ([source, count]) => (
                    <div key={source}>
                      <span>{source}</span>
                      <Badge tone="cyan">{count} roles</Badge>
                    </div>
                  ),
                )}
              </div>
              {!Object.keys(data.source_distribution).length && (
                <p>No source activity recorded yet.</p>
              )}
            </Card>
            <Card>
              <h2>Recent tasks</h2>
              <div className={styles.activity}>
                {data.recent_tasks.map((task) => (
                  <div key={task.id}>
                    <span className={styles.activityDot} />
                    <div>
                      <strong>{human(task.task_type)}</strong>
                      <p>
                        {human(task.status)} · {date(task.started_at)}
                      </p>
                      {task.error_message && (
                        <small>{task.error_message}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!data.recent_tasks.length && (
                <p className={styles.muted}>
                  No background task history to show. Actions you run will
                  appear when recorded by the service.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
export function SettingsView({ demo, base }: ViewProps) {
  const prefs = useWorkspacePreferences();
  const action = useAction();
  const user = useResource(
    async () =>
      demo
        ? ({
            email: "alex@example.test",
            full_name: "Alex · Fictional preview",
            is_active: true,
          } as User)
        : getMe(),
    [demo],
  );
  return (
    <>
      <PageHeading title="A workspace that works for you.">
        Your preferences, account, and the boundaries that keep you in control.
      </PageHeading>
      <LoadState
        loading={user.loading}
        error={user.error}
        retry={user.refresh}
      />
      <ActionNotice {...action} />
      <div className={styles.settingsGrid}>
        <Card>
          <SlidersHorizontal size={24} />
          <h2>Appearance</h2>
          <p>Warm surfaces, clear typography, and room to focus.</p>
          <label className={styles.settingRow}>
            <span>
              <strong>Compact workspace</strong>
              <small>Reduce spacing in workspace cards and navigation.</small>
            </span>
            <input
              type="checkbox"
              checked={prefs.density === "compact"}
              onChange={(e) =>
                prefs.set(
                  e.target.checked ? "compact" : "comfortable",
                  prefs.motion,
                )
              }
            />
          </label>
          <p className={styles.finePrint}>
            Appearance preferences are saved on this device. Career and resume
            information is not stored here.
          </p>
        </Card>
        <Card>
          <ShieldCheck size={24} />
          <h2>Account & security</h2>
          <div className={styles.accountFields}>
            <span>Email</span>
            <strong>{user.data?.email || "Unavailable"}</strong>
            <span>Workspace</span>
            <strong>
              {demo ? "Fictional demonstration" : "Existing owner account"}
            </strong>
            <span>Session</span>
            <strong>
              {demo ? "No private account session" : "HTTP-only cookie"}
            </strong>
          </div>
          <p className={styles.finePrint}>
            This version supports the existing owner account. Public
            registration and password changes are not available in this
            frontend.
          </p>
        </Card>
        <Card>
          <h2>Profile preferences</h2>
          <p>
            Keep target roles, skills, location, compensation, and match
            thresholds aligned with your plans.
          </p>
          <Link
            className="ui-button ui-button-secondary"
            href={`${base}/profiles`}
          >
            Edit career profiles
          </Link>
        </Card>
        <Card>
          <h2>Accessibility</h2>
          <label className={styles.settingRow}>
            <span>
              <strong>Reduce workspace motion</strong>
              <small>Remove transitions in your daily workspace.</small>
            </span>
            <input
              type="checkbox"
              checked={prefs.motion === "reduced"}
              onChange={(e) =>
                prefs.set(
                  prefs.density,
                  e.target.checked ? "reduced" : "system",
                )
              }
            />
          </label>
          <p className={styles.finePrint}>
            System reduced-motion preferences are also respected. Navigation,
            forms, and drawers support keyboard controls.
          </p>
        </Card>
        <Card>
          <h2>Supported job boards</h2>
          <div className={styles.integrationList}>
            {["Greenhouse", "Ashby", "Lever"].map((provider) => (
              <div key={provider}>
                <span>{provider}</span>
                <Badge tone="cyan">
                  <Check size={12} /> Public board discovery
                </Badge>
              </div>
            ))}
          </div>
          <Link
            className="ui-button ui-button-secondary"
            href={`${base}/discover`}
          >
            Choose an employer board
          </Link>
          <p className={styles.finePrint}>
            Discovery reads supported public job boards. It does not submit
            applications or contact recruiters.
          </p>
        </Card>
        <Card>
          <h2>Notifications & future integrations</h2>
          <div className={styles.integrationList}>
            {[
              "Email alerts",
              "Automatic applications",
              "Recruiter outreach",
              "Public multi-user accounts",
            ].map((feature) => (
              <div key={feature}>
                <span>{feature}</span>
                <Badge>Not implemented</Badge>
              </div>
            ))}
          </div>
          <p className={styles.finePrint}>
            There are no connected messaging accounts or automatic outbound
            actions in this version.
          </p>
          <Button variant="secondary" disabled>
            Notification preferences unavailable
          </Button>
        </Card>
        <Card>
          <h2>Workspace service</h2>
          <p>Check whether the local API and its database are available.</p>
          <Button
            variant="secondary"
            disabled={demo || action.busy}
            onClick={() =>
              action.run(async () => {
                const result = await request<{
                  status: string;
                  database_connected: boolean;
                }>("/health");
                action.setMessage(
                  `Service: ${result.status}. Database ${result.database_connected ? "connected" : "unavailable"}.`,
                );
              })
            }
          >
            {action.busy ? "Checking…" : "Check service status"}
          </Button>
          {demo && (
            <p className={styles.finePrint}>
              Service checks are disabled in this public preview.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
