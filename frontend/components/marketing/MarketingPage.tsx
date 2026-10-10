"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Check,
  CheckCheck,
  FileText,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  X,
  Menu,
  BriefcaseBusiness,
  Sparkles,
  MapPin,
  Plus,
  CircleCheck,
  ChevronRight,
  Layers,
  LockKeyhole,
} from "lucide-react";
import Hero3D from "../hero3d/Hero3D";
import { Brand, Button, ButtonLink } from "../ui";
import { useMediaQuery } from "../landing/useMediaQuery";
import styles from "./Marketing.module.css";
import { useScrollScene } from "./useScrollScene";

const careers = {
  Engineering: {
    roles: ["Systems engineer", "Mechanical engineer"],
    skills: ["Systems thinking", "CAD", "Technical design"],
    location: "Bengaluru + remote",
  },
  Software: {
    roles: ["Frontend engineer", "Software developer"],
    skills: ["TypeScript", "React", "Problem solving"],
    location: "Remote + hybrid",
  },
  Design: {
    roles: ["Product designer", "Brand designer"],
    skills: ["Figma", "Research", "Visual systems"],
    location: "London + remote",
  },
  Healthcare: {
    roles: ["Clinical coordinator", "Registered nurse"],
    skills: ["Patient care", "Coordination", "Clinical practice"],
    location: "Local + on-site",
  },
  Finance: {
    roles: ["Financial analyst", "Risk analyst"],
    skills: ["Forecasting", "Excel", "Financial modeling"],
    location: "Mumbai + hybrid",
  },
  Marketing: {
    roles: ["Growth marketer", "Content strategist"],
    skills: ["Campaigns", "Analytics", "Storytelling"],
    location: "Remote + hybrid",
  },
  Education: {
    roles: ["Learning designer", "Educator"],
    skills: ["Curriculum design", "Teaching", "Learning assessment"],
    location: "Local + remote",
  },
  Research: {
    roles: ["Research associate", "Data researcher"],
    skills: ["Research methods", "Analysis", "Documentation"],
    location: "University + hybrid",
  },
};
type Career = keyof typeof careers | "Other / custom";
const steps = [
  {
    name: "Discover",
    title: "Give your search a direction.",
    copy: "Choose target roles and preferences. Explore openings from the job boards currently supported by Opporbyte.",
    icon: Search,
  },
  {
    name: "Match",
    title: "See the fit. See the gaps.",
    copy: "Review skill alignment, eligibility and the reasons behind a match. A score starts a conversation; you make the decision.",
    icon: Sparkles,
  },
  {
    name: "Tailor",
    title: "Your experience, in the right order.",
    copy: "Prepare a role-specific resume from your candidate facts. Verify the information before it appears in a version.",
    icon: FileText,
  },
  {
    name: "Review & Track",
    title: "Keep the next step in sight.",
    copy: "Review each application package and keep its status organized. Complete employer-site steps yourself when required.",
    icon: CheckCheck,
  },
];
const showcaseTabs = [
  "Find Jobs",
  "Smart Matching",
  "Resume Studio",
  "Application Queue",
];
const faqs = [
  [
    "How does Opporbyte discover jobs?",
    "The current workspace can discover openings from configured Greenhouse, Lever and Ashby employer boards. Discovery is initiated by the owner. It does not search every job site or scrape arbitrary platforms.",
  ],
  [
    "Which careers can I explore?",
    "The public preview lets you explore any career direction. The current owner workspace persists Software and Semiconductor profiles. Broader career profiles and public accounts are future work.",
  ],
  [
    "How does resume tailoring work?",
    "Resume versions are assembled from candidate facts for a selected role. You can inspect selected information, verify facts and export supported text or HTML. Always review the result before using it.",
  ],
  [
    "Are applications sent automatically?",
    "No. Opporbyte organizes and tracks application packages. Submission and recruiter outreach are not automated. Some applications must be completed on the employer’s website.",
  ],
  [
    "What happens to my information?",
    "The onboarding preview keeps your entries only in this browser session and does not upload resume files. Real workspace records are stored by the authenticated backend. The project currently provides an owner-only workspace, not public registration.",
  ],
  [
    "What can I use today?",
    "The current owner workspace supports job discovery, existing career profiles, matching, candidate facts, resume preparation, application tracking and analytics. The public workspace preview uses fictional data and performs no backend actions.",
  ],
];

function DemoLabel({
  children = "Interactive preview · fictional data",
}: {
  children?: string;
}) {
  return (
    <span className={styles.demoLabel}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}
function SectionIntro({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.sectionIntro}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export default function MarketingPage() {
  const page = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const heroStage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const mobile = useMediaQuery("(max-width: 900px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const pinned = !mobile && !reduced;
  const [menuOpen, setMenuOpen] = useState(false);
  const measureHero = useCallback(
    (node: HTMLElement) => {
      if (!pinned) return 0;
      const bounds = node.getBoundingClientRect();
      const interval = Math.max(
        1,
        bounds.height - (heroStage.current?.offsetHeight ?? window.innerHeight),
      );
      return -bounds.top / interval;
    },
    [pinned],
  );
  const renderHero = useCallback(
    (value: number) => {
      progress.current = pinned ? value : 0;
      hero.current?.setAttribute("data-scene-progress", value.toFixed(4));
      heroStage.current?.setAttribute(
        "data-hero-progress",
        progress.current.toFixed(3),
      );
    },
    [pinned],
  );
  useScrollScene(hero, renderHero, reduced, null, measureHero);

  useEffect(() => {
    const sections = page.current?.querySelectorAll<HTMLElement>(
      `.${styles.section}`,
    );
    if (!sections) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.08 },
    );
    for (const section of sections) {
      section.dataset.revealReady = "true";
      section.dataset.revealed = String(
        reduced ||
          section.getBoundingClientRect().top < window.innerHeight - 40,
      );
      if (section.dataset.revealed !== "true") observer.observe(section);
    }
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div ref={page} className={styles.page}>
      <a className={styles.skip} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand className={styles.logo} />
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#careers">Your career</a>
            <a href="#workspace">The workspace</a>
          </nav>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.loginLink}>
              Sign in
            </Link>
            <ButtonLink
              href="/get-started"
              variant="secondary"
              className={styles.navCta}
            >
              Get started <ArrowUpRight size={16} />
            </ButtonLink>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className={styles.mobileNav}
          >
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#careers" onClick={() => setMenuOpen(false)}>
              Your career
            </a>
            <a href="#workspace" onClick={() => setMenuOpen(false)}>
              The workspace
            </a>
            <Link href="/login">Sign in</Link>
          </nav>
        )}
      </header>
      <main id="main-content">
        <section
          ref={hero}
          className={`${styles.hero} ${pinned ? styles.heroPinned : ""}`}
          aria-labelledby="hero-title"
        >
          <div
            ref={heroStage}
            className={styles.heroStage}
            data-hero-stage="true"
          >
            <Hero3D progress={progress} reduced={reduced} mobile={mobile} />
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>YOUR AI-POWERED CAREER WORKSPACE</p>
              <h1 id="hero-title">
                Your job hunt.
                <br />
                Finally in
                <br className={styles.desktopBreak} /> one place.
              </h1>
              <p className={styles.heroDescription}>
                Find opportunities that fit, prepare tailored resumes, and keep
                every application organized.
              </p>
              <div className={styles.heroActions}>
                <ButtonLink className={styles.primary} href="/get-started">
                  Find my next role <ArrowUpRight size={19} />
                </ButtonLink>
                <a className={styles.textLink} href="#how-it-works">
                  See how it works <ArrowDown size={17} />
                </a>
              </div>
              <p className={styles.heroNote}>
                <span aria-hidden="true" /> A thoughtful next step. A clearer
                job search.
              </p>
            </div>
            <div className={styles.heroBottom}>
              <a href="#endless-tabs">
                <ArrowDown size={16} />
                Scroll to bring it together
              </a>
              <span>One place for what comes next.</span>
            </div>
          </div>
        </section>
        <EndlessTabs />
        <CareerExplorer />
        <HowItWorks />
        <WorkspaceShowcase />
        <ResumeComparison />
        <ControlDemo />
        <Finale />
        <section
          id="faq"
          className={`${styles.section} ${styles.faq}`}
          aria-labelledby="faq-title"
        >
          <div className={styles.faqIntro}>
            <p className={styles.smallLabel}>A little clarity</p>
            <h2 id="faq-title">
              Good questions.
              <br />
              Honest answers.
            </h2>
            <p>
              Built to help you move with intention. Here’s where the product
              stands today.
            </p>
            <Link className={styles.textLink} href="/preview">
              Explore the workspace preview <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className={styles.faqList}>
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <Brand className={styles.logo} />
          <p>More focus on your next chapter.</p>
          <Link href="/get-started">
            Start exploring <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className={styles.footerBottom}>
          <p>Early product · owner workspace + public preview</p>
          <nav aria-label="Footer navigation">
            <a href="#faq">Privacy & product status</a>
            <a
              href="https://github.com/el-oggy/Opporbyte"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <ArrowUpRight size={13} />
            </a>
            <Link href="/login">Sign in</Link>
          </nav>
          <span>Opporbyte © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function EndlessTabs() {
  const area = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const progress = useRef(0);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [manualTarget, setManualTarget] = useState<number | null>(null);
  const render = useCallback((value: number) => {
    const world = area.current;
    if (!world) return;
    progress.current = value;
    world.dataset.sceneProgress = value.toFixed(4);
    const cards = Array.from(
      world.querySelectorAll<HTMLElement>("[data-search-card]"),
    );
    const width = world.clientWidth;
    const height = world.clientHeight;
    const cardWidth = cards[0]?.offsetWidth ?? 265;
    const cardHeight = Math.max(...cards.map((card) => card.offsetHeight), 1);
    const scale = Math.min(
      0.88,
      (width - 20) / (cardWidth * 2 + 16),
      (height - 62) / (cardHeight * 2),
    );
    const gap = 16;
    const starts = [
      [width * 0.04, 0, -12, -12],
      [width * 0.43, height * 0.24, 9, -18],
      [width * 0.13, height * 0.5, -6, -15],
    ];
    const ends = [
      [(width - cardWidth * scale * 2 - gap) / 2, 25, -1, -5],
      [(width + gap) / 2, 25, 1, -5],
      [(width - cardWidth * scale) / 2, 25 + cardHeight * scale + 20, 0, -5],
    ];
    cards.forEach((card, index) => {
      const local = Math.min(
        1,
        Math.max(0, (value - index * 0.055) / (1 - index * 0.055)),
      );
      const t = local * local * (3 - 2 * local);
      const pose = starts[index].map(
        (from, axis) => from + (ends[index][axis] - from) * t,
      );
      card.style.transform = `translate3d(${pose[0]}px, ${pose[1]}px, 0) rotateZ(${pose[2]}deg) rotateY(${pose[3]}deg) scale(${1 + (scale - 1) * t})`;
    });
    const title = world.querySelector<HTMLElement>("[data-organized-title]");
    if (title) {
      title.style.opacity = String(Math.max(0, (value - 0.65) / 0.35));
      title.style.transform = `translateY(${(1 - value) * 8}px)`;
    }
    const organized = value >= 0.5;
    world.setAttribute(
      "aria-label",
      organized
        ? "Job search organized into one workspace"
        : "Scattered job-search tasks",
    );
    button.current?.setAttribute("aria-pressed", String(organized));
    const text = organized
      ? "See the scattered search"
      : "Bring it all together";
    if (label.current && label.current.textContent !== text)
      label.current.textContent = text;
  }, []);
  useScrollScene(area, render, reduced, manualTarget);
  useEffect(() => {
    const resume = () => setManualTarget(null);
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, button, a, summary, [contenteditable]",
        )
      )
        return;
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        resume();
    };
    window.addEventListener("wheel", resume, { passive: true });
    window.addEventListener("touchmove", resume, { passive: true });
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("wheel", resume);
      window.removeEventListener("touchmove", resume);
      window.removeEventListener("keydown", key);
    };
  }, []);
  return (
    <section
      id="endless-tabs"
      className={`${styles.section} ${styles.tabsSection}`}
    >
      <div className={styles.tabsCopy}>
        <p className={styles.smallLabel}>Less scattered. More intentional.</p>
        <h2>
          Too many tabs.
          <br />
          Too little progress.
        </h2>
        <p>
          The role you saved. The resume you renamed. The application you meant
          to follow up. Give them a place to come together.
        </p>
        <button
          ref={button}
          type="button"
          className={styles.textButton}
          aria-pressed="false"
          onClick={() => setManualTarget(progress.current >= 0.5 ? 0 : 1)}
        >
          <span ref={label}>Bring it all together</span>
          <ArrowRight size={18} />
        </button>
      </div>
      <div
        ref={area}
        className={styles.tabWorld}
        aria-label="Scattered job-search tasks"
        data-search-world="true"
      >
        <div
          data-search-card="true"
          className={`${styles.miniBrowser} ${styles.browserOne}`}
        >
          <div className={styles.browserChrome}>
            <i />
            <i />
            <i />
            <span>opportunities</span>
          </div>
          <div className={styles.browserContent}>
            <BriefcaseBusiness size={19} />
            <strong>Product designer</strong>
            <span>Example employer · Hybrid</span>
            <div className={styles.miniLine} />
            <div className={styles.miniLineShort} />
          </div>
        </div>
        <div
          data-search-card="true"
          className={`${styles.miniBrowser} ${styles.browserTwo}`}
        >
          <div className={styles.browserChrome}>
            <i />
            <i />
            <i />
            <span>candidate facts</span>
          </div>
          <div className={styles.browserContent}>
            <FileText size={19} />
            <strong>The right resume</strong>
            <span>Verified experience, reused.</span>
            <div className={styles.miniLine} />
            <div className={styles.miniLineShort} />
          </div>
        </div>
        <div
          data-search-card="true"
          className={`${styles.miniBrowser} ${styles.browserThree}`}
        >
          <div className={styles.browserChrome}>
            <i />
            <i />
            <i />
            <span>application queue</span>
          </div>
          <div className={styles.browserContent}>
            <CircleCheck size={19} />
            <strong>A clear next step</strong>
            <span>Ready for your review</span>
            <div className={styles.queueDots}>
              <span>Draft</span>
              <ChevronRight size={12} />
              <span>Review</span>
            </div>
          </div>
        </div>
        <div data-organized-title="true" className={styles.organizedTitle}>
          <span className={styles.logoMark} /> One workspace. A little breathing
          room.
        </div>
        <span className={styles.previewCorner}>Concept illustration</span>
      </div>
    </section>
  );
}

function CareerExplorer() {
  const [career, setCareer] = useState<Career>("Design");
  const [customRole, setCustomRole] = useState("");
  const [level, setLevel] = useState("Mid-level");
  const [work, setWork] = useState("Hybrid");
  const [location, setLocation] = useState("");
  const selected =
    career === "Other / custom"
      ? {
          roles: [customRole || "Your target role"],
          skills: ["Your expertise", "Your interests"],
          location: "Your preferred location",
        }
      : careers[career];
  return (
    <section
      id="careers"
      className={`${styles.section} ${styles.careerSection}`}
    >
      <SectionIntro title="Whatever your path, make it yours.">
        Your search starts with your interests, not someone else’s idea of a
        career.
      </SectionIntro>
      <div className={styles.careerLayout}>
        <div
          className={styles.careerChoices}
          role="group"
          aria-label="Career preview categories"
        >
          {[...Object.keys(careers), "Other / custom"].map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={career === name}
              onClick={() => {
                setCareer(name as Career);
                setLocation("");
              }}
              className={career === name ? styles.selectedCareer : ""}
            >
              <span>{name}</span>
              {career === name ? (
                <Check size={18} />
              ) : (
                <ArrowUpRight size={17} />
              )}
            </button>
          ))}
        </div>
        <div className={styles.careerCard}>
          <div className={styles.cardTopline}>
            <DemoLabel>Career preference preview</DemoLabel>
            <SlidersHorizontal size={18} />
          </div>
          <h3>A direction that feels like you.</h3>
          {career === "Other / custom" && (
            <label className={styles.inputLabel}>
              Your target role
              <input
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Environmental scientist"
                maxLength={100}
              />
            </label>
          )}
          <span className={styles.fieldCaption}>Target roles</span>
          <div className={styles.roleTags}>
            {selected.roles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
          <div className={styles.preferenceGrid}>
            <label className={styles.inputLabel}>
              Location
              <input
                placeholder={selected.location}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
              />
            </label>
            <label className={styles.inputLabel}>
              Experience
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>Entry-level</option>
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Leadership</option>
              </select>
            </label>
          </div>
          <div
            className={styles.workModes}
            role="group"
            aria-label="Preview work preference"
          >
            {["Remote", "Hybrid", "On-site"].map((mode) => (
              <button
                type="button"
                key={mode}
                aria-pressed={mode === work}
                onClick={() => setWork(mode)}
              >
                {mode === work && <Check size={13} />}
                {mode}
              </button>
            ))}
          </div>
          <span className={styles.fieldCaption}>Your strengths</span>
          <div className={styles.skills}>
            {selected.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <div className={styles.careerCardFooter}>
            <p>
              Explore any path here. The current owner workspace saves Software
              and Semiconductor profiles.
            </p>
            <Link href="/get-started" className={styles.textLink}>
              Build your preferences <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const [stage, setStage] = useState(0);
  const [saved, setSaved] = useState(false);
  const step = steps[stage];
  const Icon = step.icon;
  return (
    <section
      id="how-it-works"
      className={`${styles.section} ${styles.howSection}`}
    >
      <SectionIntro title="A little structure. A lot more focus.">
        Four thoughtful steps from finding a role to knowing what comes next.
      </SectionIntro>
      <div
        className={styles.timeline}
        role="tablist"
        aria-label="How Opporbyte works"
      >
        {steps.map((item, i) => (
          <button
            key={item.name}
            id={`step-tab-${i}`}
            role="tab"
            aria-selected={stage === i}
            aria-controls={`step-panel-${i}`}
            type="button"
            onClick={() => setStage(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const next =
                  (stage + (e.key === "ArrowRight" ? 1 : -1) + 4) % 4;
                setStage(next);
                document.getElementById(`step-tab-${next}`)?.focus();
              }
            }}
            tabIndex={stage === i ? 0 : -1}
            className={stage === i ? styles.activeStep : ""}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {item.name}
          </button>
        ))}
      </div>
      <div
        className={styles.stepPanel}
        role="tabpanel"
        id={`step-panel-${stage}`}
        aria-labelledby={`step-tab-${stage}`}
      >
        <div className={styles.stepCopy}>
          <Icon size={27} />
          <h3>{step.title}</h3>
          <p>{step.copy}</p>
          <span className={styles.smallLabel}>
            You’re in control at every step.
          </span>
        </div>
        <div key={stage} className={styles.stepVisual}>
          <DemoLabel />
          {stage === 0 ? (
            <div className={styles.discoveryMini}>
              <div className={styles.demoSearch}>
                <Search size={17} />
                Product designer <span>Hybrid</span>
              </div>
              <div className={styles.miniJob}>
                <div className={styles.companyAvatar}>S</div>
                <div>
                  <strong>Product designer</strong>
                  <p>Studio North · Example opening</p>
                </div>
                <button
                  type="button"
                  aria-pressed={saved}
                  onClick={() => setSaved(!saved)}
                >
                  {saved ? <Check size={16} /> : <Plus size={16} />}
                  {saved ? "Saved in preview" : "Save in preview"}
                </button>
              </div>
              <div className={styles.miniJob}>
                <div className={`${styles.companyAvatar} ${styles.cyanAvatar}`}>
                  A
                </div>
                <div>
                  <strong>UX researcher</strong>
                  <p>Atlas Labs · Example opening</p>
                </div>
              </div>
            </div>
          ) : stage === 1 ? (
            <div className={styles.matchMini}>
              <div className={styles.matchRing}>
                <Check size={38} />
              </div>
              <div>
                <strong>Understand the alignment</strong>
                <p>Relevant: Research, design systems</p>
                <p className={styles.gapText}>
                  Check: Required industry experience
                </p>
                <span className={styles.chip}>Human review needed</span>
              </div>
            </div>
          ) : stage === 2 ? (
            <div className={styles.tailorMini}>
              <FileText size={35} />
              <h4>Relevant experience, brought forward.</h4>
              <div className={styles.highlightLine}>
                User research & design systems
              </div>
              <div className={styles.miniLine} />
              <div className={styles.miniLineShort} />
              <span className={styles.verified}>
                <ShieldCheck size={14} /> Candidate-provided facts
              </span>
            </div>
          ) : (
            <div className={styles.reviewMini}>
              {["Draft", "Ready for review", "Approved"].map((status, i) => (
                <div key={status} className={i === 1 ? styles.reviewFocus : ""}>
                  <span>{status}</span>
                  <span>
                    {i === 1 ? "Product designer" : "Example package"}
                  </span>
                  {i === 1 && <Check size={16} />}
                </div>
              ))}
              <p>No application is sent by this preview.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WorkspaceShowcase() {
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);
  return (
    <section
      id="workspace"
      className={`${styles.section} ${styles.workspaceSection}`}
    >
      <div className={styles.workspaceIntro}>
        <h2>
          One beautiful workspace.
          <br />
          Your whole search, in view.
        </h2>
        <Link className={styles.textLink} href="/preview">
          Take a closer look <ArrowUpRight size={18} />
        </Link>
      </div>
      <div
        className={styles.showcaseTabs}
        role="tablist"
        aria-label="Workspace preview"
      >
        {showcaseTabs.map((name, i) => (
          <button
            key={name}
            id={`workspace-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={tab === i}
            aria-controls={`workspace-panel-${i}`}
            tabIndex={tab === i ? 0 : -1}
            onClick={() => setTab(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const next = (tab + (e.key === "ArrowRight" ? 1 : -1) + 4) % 4;
                setTab(next);
                document.getElementById(`workspace-tab-${next}`)?.focus();
              }
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div className={styles.workspaceWindow}>
        <div className={styles.windowBar}>
          <div>
            <i />
            <i />
            <i />
          </div>
          <span>opporbyte / workspace preview</span>
          <LockKeyhole size={13} />
        </div>
        <div className={styles.workspaceBody}>
          <aside className={styles.previewSidebar} aria-hidden="true">
            <span className={styles.logoMark} />
            <span className={styles.sidebarItem}>
              <Layers size={16} />
              Overview
            </span>
            {showcaseTabs.map((name, i) => (
              <span
                key={name}
                className={tab === i ? styles.sidebarActive : ""}
              >
                {name}
              </span>
            ))}
            <span className={styles.sidebarBottom}>
              A place to move forward.
            </span>
          </aside>
          <div
            key={tab}
            className={styles.workspaceContent}
            role="tabpanel"
            id={`workspace-panel-${tab}`}
            aria-labelledby={`workspace-tab-${tab}`}
          >
            <div className={styles.previewHeading}>
              <div>
                <DemoLabel />
                <h3>{showcaseTabs[tab]}</h3>
              </div>
              <span className={styles.profilePill}>Alex’s example search</span>
            </div>
            {tab === 0 ? (
              <>
                <div className={styles.demoSearch}>
                  <Search size={18} />
                  Design, research, and a new direction
                  <SlidersHorizontal size={16} />
                </div>
                <div className={styles.showcaseJobs}>
                  {[
                    ["Product designer", "Studio North", "Hybrid"],
                    ["UX researcher", "Atlas Labs", "Remote"],
                    ["Design systems designer", "Fieldwork", "On-site"],
                  ].map(([role, company, mode], i) => (
                    <div key={role} className={styles.showcaseJob}>
                      <div className={styles.showcaseJobTop}>
                        <span className={styles.companyAvatar}>
                          {company[0]}
                        </span>
                        <span className={styles.chip}>{mode}</span>
                      </div>
                      <h4>{role}</h4>
                      <p>{company} · Example employer</p>
                      <div className={styles.jobFooter}>
                        <span>
                          <MapPin size={13} />
                          Example location
                        </span>
                        {i === 0 && (
                          <button
                            type="button"
                            aria-pressed={saved}
                            onClick={() => setSaved(!saved)}
                          >
                            {saved ? "Saved" : "Save"}
                            <Check size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : tab === 1 ? (
              <div className={styles.matchShowcase}>
                <div>
                  <span className={styles.chip}>Example match explanation</span>
                  <h4>Product designer</h4>
                  <p>Studio North</p>
                  <div className={styles.matchTags}>
                    <span>
                      <Check size={14} />
                      User research
                    </span>
                    <span>
                      <Check size={14} />
                      Design systems
                    </span>
                    <span>
                      <Check size={14} />
                      Prototyping
                    </span>
                  </div>
                </div>
                <div className={styles.evidenceCard}>
                  <ShieldCheck size={24} />
                  <h4>Know what needs a closer look.</h4>
                  <p>
                    Industry experience is not confirmed in this example
                    profile. Review the role requirements before continuing.
                  </p>
                  <span className={styles.chip}>Review needed</span>
                </div>
              </div>
            ) : tab === 2 ? (
              <div className={styles.resumeShowcase}>
                <div className={styles.resumeSheet}>
                  <p>Alex Morgan</p>
                  <h4>Product designer</h4>
                  <span>Role-specific example version</span>
                  <div className={styles.highlightLine}>
                    Research · Prototyping · Design systems
                  </div>
                  <div className={styles.miniLine} />
                  <div className={styles.miniLine} />
                  <div className={styles.miniLineShort} />
                  <span className={styles.verified}>
                    <ShieldCheck size={13} /> Facts reviewed in this example
                  </span>
                </div>
                <div className={styles.resumeNotes}>
                  <h4>Make relevance easy to find.</h4>
                  <p>
                    Relevant sections move forward. Your experience stays your
                    own.
                  </p>
                  <Link href="/preview/resumes" className={styles.textLink}>
                    Open Resume Studio preview <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.queueShowcase}>
                {["Draft", "Ready for review", "Approved"].map((status, i) => (
                  <div key={status}>
                    <h4>
                      <span className={styles.queueDot} />
                      {status}
                    </h4>
                    <div className={styles.queueCard}>
                      <span className={styles.companyAvatar}>
                        {["F", "S", "A"][i]}
                      </span>
                      <strong>
                        {
                          [
                            "Design systems designer",
                            "Product designer",
                            "UX researcher",
                          ][i]
                        }
                      </strong>
                      <p>{["Fieldwork", "Studio North", "Atlas Labs"][i]}</p>
                      <span className={styles.chip}>
                        {i === 1 ? "Check your resume" : "Example package"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className={styles.previewDisclaimer}>
              Fictional demonstration. These interactions do not search jobs,
              run AI or change private account data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResumeComparison() {
  const [highlight, setHighlight] = useState(true);
  return (
    <section
      id="resumes"
      className={`${styles.section} ${styles.resumeSection}`}
    >
      <div className={styles.resumeIntro}>
        <p className={styles.smallLabel}>Same experience. Clearer relevance.</p>
        <h2>
          Resumes that fit
          <br />
          the role.
        </h2>
        <p>
          Bring the most relevant parts of your experience forward. Reuse
          verified information, with every claim still yours to review.
        </p>
        <button
          type="button"
          className={styles.textButton}
          aria-pressed={highlight}
          onClick={() => setHighlight(!highlight)}
        >
          {highlight ? "Hide the changes" : "Highlight the changes"}
          <Sparkles size={17} />
        </button>
        <p className={styles.resumeFootnote}>
          Example candidate facts. No achievements invented. No interview
          guarantees.
        </p>
      </div>
      <div
        className={`${styles.documents} ${highlight ? styles.highlighted : ""}`}
      >
        <article className={styles.beforeDocument}>
          <div className={styles.documentLabel}>General version</div>
          <h3>Alex Morgan</h3>
          <p>Designer</p>
          <hr />
          <h4>Experience</h4>
          <p>Worked on research, interfaces and shared design components.</p>
          <h4>Skills</h4>
          <p>
            Communication, Figma, prototyping, user research, design systems.
          </p>
          <div className={styles.miniLine} />
          <div className={styles.miniLineShort} />
        </article>
        <span className={styles.documentArrow} aria-hidden="true">
          <ArrowRight size={23} />
        </span>
        <article className={styles.afterDocument}>
          <div className={styles.documentLabel}>For a product design role</div>
          <h3>Alex Morgan</h3>
          <p>Product designer</p>
          <hr />
          <h4>Relevant skills</h4>
          <p className={styles.factHighlight}>
            User research, design systems, prototyping.
          </p>
          <h4>Relevant experience</h4>
          <p className={styles.factHighlight}>
            Worked on research, interfaces and shared design components.
          </p>
          <span className={styles.verified}>
            <ShieldCheck size={14} /> Reordered from the same example facts
          </span>
        </article>
      </div>
    </section>
  );
}

function ControlDemo() {
  const [checks, setChecks] = useState([false, false, false]);
  const [approved, setApproved] = useState(false);
  const ready = checks.every(Boolean);
  return (
    <section
      id="control"
      className={`${styles.section} ${styles.controlSection}`}
    >
      <div className={styles.approvalCard}>
        <div className={styles.cardTopline}>
          <DemoLabel>Local approval demonstration</DemoLabel>
          <ShieldCheck size={21} />
        </div>
        <h3>
          {approved
            ? "Reviewed. Ready for your next step."
            : "A final look before the next step."}
        </h3>
        <p>
          Product designer · Studio North
          <br />
          <span>Example application package</span>
        </p>
        <div className={styles.approvalChecks}>
          {[
            "Candidate facts are accurate",
            "I have reviewed the resume",
            "I understand the employer-site steps",
          ].map((label, i) => (
            <label key={label}>
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={(e) => {
                  setChecks(
                    checks.map((value, index) =>
                      index === i ? e.target.checked : value,
                    ),
                  );
                  setApproved(false);
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <Button
          className={styles.primary}
          disabled={!ready || approved}
          onClick={() => setApproved(true)}
        >
          {approved ? (
            <>
              <Check size={18} />
              Marked reviewed in preview
            </>
          ) : (
            <>
              Mark reviewed in preview <ArrowRight size={18} />
            </>
          )}
        </Button>
        <p className={styles.approvalNote} role="status">
          {approved
            ? "Review state updated only here. Nothing was submitted or sent."
            : "This demonstration sends nothing. You decide what happens next."}
        </p>
      </div>
      <div className={styles.controlCopy}>
        <p className={styles.smallLabel}>Assistance with a human in the loop</p>
        <h2>You’re in control.</h2>
        <p>
          Your facts. Your choices. Your final review. A useful workspace should
          make decisions clearer, not make them for you.
        </p>
        <ul>
          <li>
            <Check size={17} /> Candidate information you can inspect and
            verify.
          </li>
          <li>
            <Check size={17} /> Clear review states and application statuses.
          </li>
          <li>
            <Check size={17} /> Private workspace behind owner sign-in.
          </li>
        </ul>
        <p className={styles.manualNote}>
          Some applications need manual completion on employer sites. Automatic
          submission and recruiter outreach are not available.
        </p>
      </div>
    </section>
  );
}

function Finale() {
  const section = useRef<HTMLElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const render = useCallback((value: number) => {
    const node = section.current;
    const world = node?.querySelector<HTMLElement>("[data-finale-world]");
    if (!node || !world) return;
    node.dataset.sceneProgress = value.toFixed(4);
    const width = world.clientWidth;
    const boardWidth = Math.min(465, width);
    const unit = boardWidth / 465;
    const x = (width - boardWidth) / 2;
    const stage = world.querySelector<HTMLElement>("[data-finale-stage]");
    const board = world.querySelector<HTMLElement>("[data-finale-board]");
    if (stage) {
      stage.style.transform = `translate3d(${x}px, ${(45 + (1 - value) * 18) * unit}px, 0) rotateY(${-8 * (1 - value)}deg) scale(${unit})`;
    }
    if (board) {
      board.style.opacity = String(0.12 + value * 0.88);
    }
    // Every piece docks in the same plane. The right column shares an edge and
    // width, and the profile and review card finish on the same baseline.
    const starts = [
      [285, -130, 18, -28, 0.52, 65],
      [-20, 166, -14, 20, 0.78, 90],
      [275, 225, 8, -15, 0.9, 60],
      [28, 315, -6, 0, 0.85, 35],
    ];
    const ends = [
      [24, 14, 0, 0, 0.08, 0],
      [28, 122, 0, 0, 0.87, 0],
      [197, 122, 0, 0, 240 / 210, 0],
      [197, 279, 0, 0, 0.96, 0],
    ];
    const windows = [
      [0.08, 0.62],
      [0.22, 0.8],
      [0.14, 0.7],
      [0.48, 0.96],
    ];
    const lifts = [0, 18, 14, 8];
    const pieces = world.querySelectorAll<HTMLElement>("[data-finale-piece]");
    pieces.forEach((piece, index) => {
      const local = Math.min(
        1,
        Math.max(
          0,
          (value - windows[index][0]) / (windows[index][1] - windows[index][0]),
        ),
      );
      // Zero velocity and acceleration at both ends keep docking gentle when
      // scrolling forward or reversing through the scene.
      const t = local * local * local * (local * (local * 6 - 15) + 10);
      const pose = starts[index].map(
        (from, axis) => from + (ends[index][axis] - from) * t,
      );
      const lift = Math.sin(Math.PI * t) * lifts[index];
      piece.style.transform = `translate3d(${pose[0]}px, ${pose[1] - lift}px, ${pose[5]}px) rotateZ(${pose[2]}deg) rotateY(${pose[3]}deg) scale(${pose[4]})`;
    });
  }, []);
  useScrollScene(section, render, reduced);
  return (
    <section
      ref={section}
      className={styles.finale}
      data-finale="true"
      aria-labelledby="finale-title"
    >
      <div
        data-finale-world="true"
        className={styles.finaleWorld}
        aria-hidden="true"
      >
        <div className={styles.finaleOrbit} />
        <div data-finale-stage="true" className={styles.finaleStage}>
          <div data-finale-board="true" className={styles.finaleWorkspace}>
            <span className={styles.finaleWorkspaceBar}>
              opporbyte / your next chapter
            </span>
            <div className={styles.finaleWorkspaceHead}>
              Everything has a place.
            </div>
          </div>
          <div data-finale-piece="core" className={styles.finaleCore} />
          <div data-finale-piece="resume" className={styles.finalePaper}>
            <small className={styles.finalePieceLabel}>Your profile</small>
            <span />
            <span />
            <span />
            <i />
            <small className={styles.finalePaperNote}>Ready to tailor</small>
          </div>
          <div data-finale-piece="opportunity" className={styles.finaleJob}>
            <small className={styles.finalePieceLabel}>
              Your next opportunity
            </small>
            <span />
            <span />
            <i />
          </div>
          <div data-finale-piece="review" className={styles.finaleStatus}>
            <Check size={17} /> Ready for what’s next
          </div>
        </div>
      </div>
      <div className={styles.finaleCopy}>
        <p className={styles.finaleLabel}>
          Bring your next chapter into focus.
        </p>
        <h2 id="finale-title">
          Your next chapter
          <br />
          starts here.
        </h2>
        <p>More focus on the opportunities that matter.</p>
        <ButtonLink className={styles.primary} href="/get-started">
          Start my job search <ArrowUpRight size={21} />
        </ButtonLink>
      </div>
    </section>
  );
}
