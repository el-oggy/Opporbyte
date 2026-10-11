"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  UsersRound,
  FileText,
  ListChecks,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Brand, Button } from "@/components/ui";
import { useMediaQuery } from "@/components/landing/useMediaQuery";
import { logout } from "./api";
import { useWorkspacePreferences } from "./preferences";
import { useCareerProfile } from "./CareerProfileContext";
import { Dashboard, Discover, JobDetail } from "./OpportunityViews";
import Profiles from "./Profiles";
import Resumes from "./Resumes";
import Applications from "./Applications";
import { Analytics, SettingsView } from "./ReportingViews";
import type { ProfileType } from "./types";
import styles from "./Workspace.module.css";
export type Section =
  | "dashboard"
  | "discover"
  | "job"
  | "profiles"
  | "resumes"
  | "applications"
  | "analytics"
  | "settings";
export type ViewProps = { demo: boolean; profile: ProfileType; base: string };
const navigation = [
  { section: "dashboard", label: "Overview", path: "", icon: LayoutDashboard },
  {
    section: "discover",
    label: "Discover jobs",
    path: "/discover",
    icon: Search,
  },
  {
    section: "profiles",
    label: "Career profiles",
    path: "/profiles",
    icon: UsersRound,
  },
  {
    section: "resumes",
    label: "Resume studio",
    path: "/resumes",
    icon: FileText,
  },
  {
    section: "applications",
    label: "Application queue",
    path: "/applications",
    icon: ListChecks,
  },
  {
    section: "analytics",
    label: "Analytics",
    path: "/analytics",
    icon: ChartNoAxesCombined,
  },
  { section: "settings", label: "Settings", path: "/settings", icon: Settings },
];
export default function WorkspacePage({
  section,
  jobId,
  mode = "live",
}: {
  section: Section;
  jobId?: string;
  mode?: "live" | "demo";
}) {
  const router = useRouter();
  const preferences = useWorkspacePreferences();
  const demo = mode === "demo";
  const base = demo ? "/preview" : "/app";
  const { profile, setProfile } = useCareerProfile();
  const [open, setOpen] = useState(false);
  const mobile = useMediaQuery("(max-width: 768px)");
  const navigationOpen = mobile && open;
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const props = { demo, profile, base };
  useEffect(() => {
    if (!navigationOpen) return;
    const panel = sidebar.current;
    const trigger = menuButton.current;
    if (!panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), select:not(:disabled), [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    panel.addEventListener("keydown", keyboard);
    return () => {
      panel.removeEventListener("keydown", keyboard);
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [navigationOpen]);
  return (
    <div
      className={styles.workspace}
      data-density={preferences.density}
      data-motion={preferences.motion}
    >
      <a href="#workspace-main" className={styles.skip}>
        Skip to workspace
      </a>
      <aside
        ref={sidebar}
        id="workspace-navigation"
        className={`${styles.sidebar} ${navigationOpen ? styles.sidebarOpen : ""}`}
        aria-label="Workspace navigation"
        role={navigationOpen ? "dialog" : undefined}
        aria-modal={navigationOpen ? true : undefined}
        inert={mobile && !navigationOpen}
      >
        <div className={styles.brandRow}>
          <Brand />
          <Button
            variant="ghost"
            className={styles.closeMenu}
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        <p className={styles.sidebarLabel}>Your career workspace</p>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.section}
              href={`${base}${item.path}`}
              aria-current={section === item.section ? "page" : undefined}
              className={section === item.section ? styles.navActive : ""}
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.reviewNote}>
            <span className={styles.miniCore}>o</span>
            <strong>
              Your next chapter,
              <br />
              with a little more clarity.
            </strong>
            <p>You stay in control of every application.</p>
          </div>
          <Link href="/">
            Back to Opporbyte <ArrowUpRight size={16} />
          </Link>
          {demo ? (
            <Link href="/login">
              Sign in to your workspace <ArrowUpRight size={16} />
            </Link>
          ) : (
            <Button
              variant="ghost"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                try {
                  await logout();
                  router.replace("/login");
                } catch (e) {
                  setLogoutError(
                    e instanceof Error ? e.message : "Could not sign out.",
                  );
                  setSigningOut(false);
                }
              }}
            >
              <LogOut size={16} />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          )}
          {logoutError && <p role="alert">{logoutError}</p>}
        </div>
      </aside>
      {navigationOpen && (
        <button
          type="button"
          className={styles.navBackdrop}
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={() => setOpen(false)}
        />
      )}
      <div className={styles.mainColumn} inert={navigationOpen}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <Button
              ref={menuButton}
              variant="ghost"
              className={styles.menuToggle}
              aria-label="Open workspace navigation"
              aria-expanded={navigationOpen}
              aria-controls="workspace-navigation"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong>
              {section === "job"
                ? "Job details"
                : navigation.find((item) => item.section === section)?.label}
            </strong>
          </div>
          <label className={styles.profilePicker}>
            Career profile
            <select
              aria-label="Active career profile"
              value={profile}
              onChange={(e) => setProfile(e.target.value as ProfileType)}
            >
              <option value="software">Software</option>
              <option value="semiconductor">Semiconductor</option>
            </select>
          </label>
          <span
            className={styles.avatar}
            aria-label={demo ? "Demo profile" : "Private workspace"}
          >
            {demo ? "D" : "O"}
          </span>
        </header>
        {demo && (
          <div className={styles.demoBanner}>
            <strong>Workspace preview</strong>
            <span>
              Fictional examples. Changes stay in this browser session; no
              account or AI tasks are created.
            </span>
            <Link href="/login">Open my workspace</Link>
          </div>
        )}
        <main
          id="workspace-main"
          tabIndex={-1}
          className={styles.main}
          key={`${section}-${profile}`}
        >
          {section === "dashboard" && <Dashboard {...props} />}{" "}
          {section === "discover" && <Discover {...props} />}{" "}
          {section === "job" && <JobDetail {...props} jobId={jobId || ""} />}{" "}
          {section === "profiles" && <Profiles {...props} />}{" "}
          {section === "resumes" && <Resumes {...props} />}{" "}
          {section === "applications" && <Applications {...props} />}{" "}
          {section === "analytics" && <Analytics {...props} />}{" "}
          {section === "settings" && <SettingsView {...props} />}
        </main>
        <footer className={styles.workspaceFooter}>
          <span>Thoughtfully organized. Always your decision.</span>
          <Link href="/get-started">Explore career preferences</Link>
        </footer>
      </div>
    </div>
  );
}
