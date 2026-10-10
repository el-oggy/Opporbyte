# Opporbyte complete frontend redesign

## Direction
Warm Intelligent Minimalism + Luxury Cinematic 3D. An editorial cream landing
page presents one original ceramic orange O and dimensional opportunities.
The workspace uses the same typography and palette with quiet surfaces and
fast, explicit actions. Backend capabilities remain the authority for claims.

## Shared tokens
Cream #F4E7D2; ink #202420; orange #FF6B2B; cyan #B9F0EC;
warm white #FFFDF8. Muted text #64675E. Orange buttons use ink text;
small orange text uses darker #A53D13 for readable contrast.
Space Grotesk display, Inter body. Spacing 4/8/12/16/24/32/48/64/96.
Radii 10px controls, 20px cards, 28px showcases. Shadows warm and restrained.
Breakpoints 640/900/1200px; minimum review width 320px.
UI transitions 160–220ms. Reduced motion removes entrance, parallax and idle
motion; no loading animation blocks navigation. Shared primitives live in
components/ui, with ui-* classes; area styles are scoped m-*, w-* and o-*.

## Ownership and implementation sequence
Lead: global CSS, root layout, all route wrappers, auth session provider,
Next proxy configuration, shared primitives, integration tests and documentation.
Agent A: components/hero3d only; genuine R3F scene, reusable original geometry,
lighting, reversible choreography, mobile and WebGL fallbacks.
Agent B: components/marketing only; public navigation, DOM hero copy, all nine
sections, interactive labeled demonstrations and footer.
Agent C: components/workspace only; shell, all eight views, typed API adapter
reconstructed from backend routes and legacy contracts, live/demo separation.
Agent D: components/onboarding only; ephemeral wizard and owner login UX.
There are three worker slots. A/B/C run concurrently; D starts when one finishes.
Agents must not edit global CSS, package files, routes or backend. No agent runs
an overlapping Next build or server. Existing legacy sources remain preserved.

## Component contracts
Hero3D: default export components/hero3d/Hero3D.tsx. Props
`{ progress: RefObject<number>; reduced: boolean; mobile: boolean }`.
Absolute full-area host. Marketing owns progress from its hero's short scroll
interval, clamped 0–1 and reversible. Canvas doesn't obstruct DOM links/text.
MarketingPage: default export components/marketing/MarketingPage.tsx; no props.
WorkspacePage: default export components/workspace/WorkspacePage.tsx; props
`{ section: 'dashboard'|'discover'|'job'|'profiles'|'resumes'|'applications'|'analytics'|'settings'; jobId?: string; mode?: 'live'|'demo' }`.
Workspace API module: components/workspace/api.ts. Export `request<T>(path,
init?)`, `getMe()`, `login(email,password)`, `logout()` and User type. Requests
use `/api/v1`, credentials include; never persist authentication tokens.
Lead SessionProvider exposes useSession with user, status, refresh and signOut.
Status checking/authenticated/anonymous/unavailable. Private layout gates child
mounting; no public marketing or demo invokes protected APIs.
OnboardingPage: default export components/onboarding/OnboardingPage.tsx.
LoginPage: default export components/onboarding/LoginPage.tsx. Login consumes
workspace API and performs a full navigation after success to a validated
`/app` destination. No fake registration. Resume files remain only in memory.
Shared exports components/ui/index.tsx: Button, ButtonLink, Card, Badge,
Field, EmptyState, PageHeading, Tabs, Drawer, Brand. Children/classes accepted.

## Routing and data boundaries
Public /, /get-started, /login. Protected /app and all requested subpages.
Public /preview and matching subpages are explicitly fictional demonstrations,
make no API requests and never substitute for private account data. Old deep
links redirect to their /app equivalents; /onboarding redirects /get-started.
Same-origin Next rewrite forwards /api/v1 to OPPORBYTE_API_URL (default local
127.0.0.1:8000). Backend HTTP-only cookie auth is preserved. No backend changes.
Only Semiconductor and Software are real persistent profiles; all other
careers are public preview concepts. No uploads, scraping, auto-applications,
outreach, unsupported PDFs or fabricated account statistics.

## Baseline and acceptance
Baseline lint/typecheck/build and seven pose tests passed before implementation.
Inspect desktop, laptop, tablet, 390px and 320px views; verify keyboard/focus,
wizard validation, auth gating, redirects, API contracts, reduced motion,
WebGL startup/context loss, reversible scene transformation and no overflow.
Capture hero, middle sections, finale, wizard and key workspace views.
Local branch design/full-frontend-redesign. No publishing or GitHub mutation.
