"use client";
import { useEffect, useRef, useState, type DependencyList } from "react";
import Link from "next/link";
import { Badge, Button, EmptyState } from "@/components/ui";
import type { Job, JobMatch } from "./types";
import styles from "./Workspace.module.css";
export function useResource<T>(
  loader: () => Promise<T>,
  dependencies: DependencyList,
) {
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(async () => {
        if (cancelled) return;
        setData(null);
        setLoading(true);
        setError("");
        const result = await loaderRef.current();
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((failure: unknown) => {
        if (!cancelled) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Unable to load this view.",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [...dependencies, revision]); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    data,
    setData,
    error,
    loading,
    refresh: () => {
      setLoading(true);
      setError("");
      setRevision((value) => value + 1);
    },
  };
}
export function LoadState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  if (error)
    return (
      <div className={styles.error} role="alert">
        <strong>We couldn’t load your workspace.</strong>
        <p>{error}</p>
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
        <Link href="/login">Sign in again</Link>
      </div>
    );
  if (loading)
    return (
      <div className={styles.loading} role="status">
        Loading your workspace…
      </div>
    );
  return null;
}
export function human(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ");
}
export function date(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
  });
}
export function safeEmployerUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function JobCard({
  job,
  match,
  base,
  onSave,
  saved,
}: {
  job: Job;
  match?: JobMatch;
  base: string;
  onSave?: (job: Job) => void;
  saved?: boolean;
}) {
  return (
    <article className={styles.jobCard}>
      <div className={styles.jobTop}>
        <span className={styles.companyIcon} aria-hidden="true">
          {job.company.slice(0, 1)}
        </span>
        <span>{job.company}</span>
        {match && (
          <Badge tone={match.classification === "strong" ? "cyan" : "neutral"}>
            {match.overall_score}% match
          </Badge>
        )}
      </div>
      <Link
        className={styles.jobTitle}
        href={`${base}/jobs/${encodeURIComponent(job.id)}`}
      >
        {job.title}
      </Link>
      <p className={styles.meta}>
        {job.location} · {human(job.work_mode)} · {human(job.employment_type)}
      </p>
      <p className={styles.jobExcerpt}>
        {job.description.slice(0, 135)}
        {job.description.length > 135 ? "…" : ""}
      </p>
      <div className={styles.jobBottom}>
        <Link href={`${base}/jobs/${encodeURIComponent(job.id)}`}>
          Review role <span aria-hidden="true">↗</span>
        </Link>
        {onSave && (
          <Button variant="ghost" onClick={() => onSave(job)} disabled={saved}>
            {saved ? "In queue" : "Save to queue"}
          </Button>
        )}
      </div>
    </article>
  );
}
export function NoItems({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return <EmptyState title={title}>{children}</EmptyState>;
}
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return {
    busy,
    message,
    error,
    setMessage,
    run: async (task: () => Promise<void>, success?: string) => {
      setBusy(true);
      setError("");
      setMessage("");
      try {
        await task();
        if (success) setMessage(success);
      } catch (e: unknown) {
        setError(
          e instanceof Error
            ? e.message
            : "This action could not be completed.",
        );
      } finally {
        setBusy(false);
      }
    },
  };
}
export function ActionNotice({
  message,
  error,
}: {
  message: string;
  error: string;
}) {
  return (
    <>
      {message && (
        <p className={styles.notice} role="status">
          {message}
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
