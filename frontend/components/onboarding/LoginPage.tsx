"use client";

import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Badge, Brand, Button, ButtonLink, Field } from "../ui";
import { ApiError, login } from "../workspace/api";
import { workspaceDestination } from "../../lib/navigation";
import styles from "./onboarding.module.css";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your owner email and password.");
      window.requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      window.location.assign(workspaceDestination(searchParams.get("next")));
    } catch (failure) {
      setError(
        failure instanceof ApiError
          ? failure.status === 401
            ? "That email or password did not match the existing owner account."
            : failure.status === 0 || failure.status >= 500
              ? "The local workspace service is unavailable. Start the backend, then try signing in again."
              : failure.message
          : "Sign-in could not be completed. Try again.",
      );
      setBusy(false);
      window.requestAnimationFrame(() => errorRef.current?.focus());
    }
  }
  return (
    <div className={styles.page}>
      <a href="#login-main" className="skip-link">
        Skip to sign in
      </a>
      <header className={styles.header}>
        <Brand />
        <ButtonLink href="/get-started" variant="ghost">
          Explore the preview <ArrowRight size={16} aria-hidden="true" />
        </ButtonLink>
      </header>
      <main
        id="login-main"
        className={`${styles.layout} ${styles.loginLayout}`}
      >
        <section className={`${styles.formArea} ${styles.loginForm}`}>
          <Badge tone="cyan">Existing owner workspace</Badge>
          <div className={styles.titleRow}>
            <h1>
              Good to have
              <br />
              you back.
            </h1>
            <p>Pick up your search where you left it.</p>
          </div>
          <form onSubmit={submit}>
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
            <div className={styles.fields}>
              <Field label="Email address" htmlFor="owner-email">
                <input
                  id="owner-email"
                  type="email"
                  autoComplete="username"
                  required
                  disabled={busy}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your existing owner email"
                />
              </Field>
              <Field label="Password" htmlFor="owner-password">
                <div className={styles.passwordInput}>
                  <input
                    id="owner-password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={busy}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible((value) => !value)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              <Button type="submit" disabled={busy} className={styles.signIn}>
                {busy ? "Signing in…" : "Sign in to workspace"}
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
            </div>
          </form>
          <div className={styles.privacy}>
            <ShieldCheck size={20} aria-hidden="true" />
            <p>
              Use your configured owner account. New public account registration
              is not available. Sign-in uses a secure server-managed session;
              credentials are never stored in your browser storage.
            </p>
          </div>
          <div className={styles.demoExit}>
            <p>Just taking a look?</p>
            <ButtonLink href="/preview" variant="secondary">
              Open the demo workspace
            </ButtonLink>
            <small>Fictional examples. No sign-in needed.</small>
          </div>
        </section>
        <aside className={`${styles.contextPanel} ${styles.loginPanel}`}>
          <div>
            <span className={styles.lockIcon}>
              <LockKeyhole size={27} aria-hidden="true" />
            </span>
            <h2>
              Your opportunities.
              <br />
              Your workspace.
            </h2>
            <p>
              One place to discover roles, prepare your resume and keep your
              applications moving.
            </p>
          </div>
          <div className={styles.loginMini}>
            <span>Your job search</span>
            <div>
              <i />
              <strong>Find the right fit</strong>
              <CheckMark />
            </div>
            <div>
              <i />
              <strong>Prepare with care</strong>
              <CheckMark />
            </div>
            <div>
              <i />
              <strong>Review every next step</strong>
              <CheckMark />
            </div>
          </div>
          <div className={styles.contextBottom}>
            <span>Private by design</span>
            <p>
              The next move
              <br />
              is always yours.
            </p>
          </div>
        </aside>
      </main>
      <footer className={styles.pageFooter}>
        <span>opporbyte · Thoughtfully organized opportunities.</span>
        <ButtonLink href="/" variant="ghost">
          Back to home
        </ButtonLink>
      </footer>
    </div>
  );
}
function CheckMark() {
  return (
    <span className={styles.miniTick} aria-hidden="true">
      ✓
    </span>
  );
}
