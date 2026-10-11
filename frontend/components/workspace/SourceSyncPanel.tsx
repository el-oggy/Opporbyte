"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Drawer, Field } from "@/components/ui";
import { json, query, request } from "./api";
import { ActionNotice, human, useAction, useResource } from "./common";
import type { ProfileType, TaskRunItem } from "./types";
import styles from "./Workspace.module.css";

type Source = {
  source_id: string;
  provider: string;
  board_token: string;
  is_active: boolean;
  active_task_id?: string | null;
};

export default function SourceSyncPanel({
  demo,
  profile,
  open,
  onClose,
  onComplete,
}: {
  demo: boolean;
  profile: ProfileType;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [provider, setProvider] = useState("greenhouse");
  const [board, setBoard] = useState("");
  const [limit, setLimit] = useState(25);
  const [selected, setSelected] = useState("");
  const [running, setRunning] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  // Keep the same key after a network error: retry can retrieve a completed run.
  const pending = useRef<{
    source: string;
    profile: ProfileType;
    limit: number;
    key: string;
  } | null>(null);
  const action = useAction();
  const resource = useResource(async () => {
    if (demo) return { sources: [] as Source[], tasks: [] as TaskRunItem[] };
    const [sources, tasks] = await Promise.all([
      request<Source[]>("/automation/sources"),
      request<TaskRunItem[]>(
        `/automation/syncs${query({ profile_type: profile })}`,
      ),
    ]);
    return { sources, tasks };
  }, [demo, profile]);
  const sources = resource.data?.sources || [];
  const tasks = resource.data?.tasks || [];
  const active = tasks.find((task) => task.status === "running");
  const activeId = active?.id;
  const setResourceData = resource.setData;
  const sourceId = sources.some((source) => source.source_id === selected)
    ? selected
    : sources.find((source) => source.is_active)?.source_id || "";

  useEffect(() => {
    if (demo || (!running && !activeId)) return;
    let stopped = false;
    const timer = setInterval(async () => {
      try {
        const history = await request<TaskRunItem[]>(
          `/automation/syncs${query({ profile_type: profile })}`,
        );
        if (!stopped)
          setResourceData((data) =>
            data ? { ...data, tasks: history } : data,
          );
      } catch {
        /* The persistent history can be reloaded after the request finishes. */
      }
    }, 1500);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [demo, running, activeId, profile, setResourceData]);

  const sync = async (id: string) => {
    if (demo) {
      action.setMessage("Preview only. No employer board was contacted.");
      return;
    }
    setRunning(true);
    setCancelMessage("");
    if (
      !pending.current ||
      pending.current.source !== id ||
      pending.current.profile !== profile ||
      pending.current.limit !== limit
    ) {
      pending.current = {
        source: id,
        profile,
        limit,
        key: crypto.randomUUID(),
      };
    }
    try {
      const task = await request<TaskRunItem>(
        "/automation/syncs",
        json("POST", {
          source_id: id,
          profile_type: profile,
          limit,
          idempotency_key: pending.current.key,
        }),
      );
      pending.current = null;
      const result = task.result || {};
      if (task.status === "failed" || task.status === "interrupted") {
        throw new Error(
          task.error_message ||
            "Sync did not complete. Start a new sync to retry.",
        );
      }
      action.setMessage(
        task.status === "running"
          ? "This sync is already running. Its status appears below."
          : task.status === "cancelled"
            ? "Sync cancelled. No results were saved."
            : `${task.status === "partial" ? "Sync completed with skipped records." : "Sync completed."} ${result.new_jobs_count || 0} new roles, ${result.eligible_count || 0} eligible, ${result.excluded_count || 0} excluded, ${result.rejected_count || 0} malformed records skipped.`,
      );
      onComplete();
    } finally {
      setRunning(false);
      resource.refresh();
    }
  };

  return (
    <section className={styles.syncPanel} aria-label="Job source sync">
      {!demo && (
        <>
          <div className={styles.syncControls}>
            <Field label="Configured source" htmlFor="sync-source">
              <select
                id="sync-source"
                value={sourceId}
                onChange={(e) => setSelected(e.target.value)}
                disabled={action.busy}
              >
                {!sources.length && (
                  <option value="">
                    {resource.loading
                      ? "Loading sources…"
                      : "Connect an employer board first"}
                  </option>
                )}
                {sources.map((source) => (
                  <option
                    key={source.source_id}
                    value={source.source_id}
                    disabled={!source.is_active}
                  >
                    {source.board_token} · {human(source.provider)}
                    {!source.is_active ? " (paused)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Button
              variant="secondary"
              disabled={!sourceId || action.busy || !!active}
              onClick={() => action.run(() => sync(sourceId))}
            >
              {running ? "Syncing openings…" : "Sync now"}
            </Button>
          </div>
          <p className={styles.finePrint}>
            Uses your {human(profile)} profile. Syncs run on request; scheduled
            sync is not enabled.
          </p>
          {resource.error && (
            <div role="alert" className={styles.error}>
              <p>{resource.error}</p>
              <Button variant="ghost" onClick={resource.refresh}>
                Reload sync history
              </Button>
            </div>
          )}
          {tasks.length > 0 && (
            <div className={styles.syncHistory}>
              <h2>Recent syncs</h2>
              {tasks.slice(0, 3).map((task) => (
                <div className={styles.syncRun} key={task.id}>
                  <div>
                    <strong>
                      {String(task.parameters?.board_token || "Employer board")}
                    </strong>{" "}
                    <Badge
                      tone={task.status === "succeeded" ? "cyan" : "neutral"}
                    >
                      {human(task.status)}
                    </Badge>
                    <p>
                      {new Date(task.started_at).toLocaleString()} ·{" "}
                      {Number(task.result?.attempts || 0)}{" "}
                      {Number(task.result?.attempts || 0) === 1
                        ? "attempt"
                        : "attempts"}
                    </p>
                    {task.error_message && (
                      <p role="status">{task.error_message}</p>
                    )}
                    {task.status === "partial" && (
                      <p>
                        Skipped {Number(task.result?.rejected_count || 0)}{" "}
                        malformed{" "}
                        {Number(task.result?.rejected_count || 0) === 1
                          ? "record"
                          : "records"}
                        ; valid roles were saved.
                      </p>
                    )}
                  </div>
                  {task.status === "running" && (
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await request(
                            `/automation/syncs/${encodeURIComponent(task.id)}/cancel`,
                            json("POST", {}),
                          );
                          setCancelMessage(
                            "Cancellation requested. The sync will stop before saving its results.",
                          );
                        } catch (failure) {
                          setCancelMessage(
                            failure instanceof Error
                              ? failure.message
                              : "Unable to cancel. Reload the status and try again.",
                          );
                        }
                      }}
                    >
                      Cancel sync
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {cancelMessage && <p role="status">{cancelMessage}</p>}
      <ActionNotice {...action} />
      <Drawer
        open={open}
        onClose={onClose}
        title="Connect a supported job board"
      >
        <p>
          Read public openings from a specific employer’s Greenhouse, Ashby or
          Lever board, then rank them against your {human(profile)} profile.
        </p>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            action.run(async () => {
              if (demo) return sync("");
              const source = await request<Source>(
                "/automation/sources",
                json("POST", { provider, board_token: board.trim() }),
              );
              setSelected(source.source_id);
              await sync(source.source_id);
            });
          }}
        >
          <Field label="Provider" htmlFor="board-provider">
            <select
              id="board-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              disabled={action.busy}
            >
              {["greenhouse", "ashby", "lever"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Employer board slug"
            htmlFor="board-slug"
            hint="Use the employer’s public board identifier, not a full URL."
          >
            <input
              id="board-slug"
              required
              maxLength={64}
              pattern={"[A-Za-z0-9_\\-]+"}
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              placeholder="company-slug"
              disabled={action.busy}
            />
          </Field>
          <Field label="Maximum openings" htmlFor="board-limit">
            <input
              id="board-limit"
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={action.busy}
            />
          </Field>
          <Button type="submit" disabled={action.busy}>
            {action.busy
              ? "Syncing openings…"
              : demo
                ? "Try preview"
                : "Configure and sync"}
          </Button>
          <ActionNotice {...action} />
        </form>
      </Drawer>
    </section>
  );
}
