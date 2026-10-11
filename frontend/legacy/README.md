# Preserved dashboard source

This directory retains the original app, components, hooks and types from commit f951f27 without altering their contents. The original frontend cannot build from a fresh checkout: its pages and providers import `@/lib/api`, which is absent from tracked files and repository history. The root `.gitignore` contains a broad `lib/` exclusion.

Sprint 01 is a standalone frontend prototype. This source is deliberately outside active Next.js routing, TypeScript checks and lint. No replacement API client, authentication or backend integration was invented. Restore the original directories and supply the real client in a separate integration task. The original root README and backend remain intact.
