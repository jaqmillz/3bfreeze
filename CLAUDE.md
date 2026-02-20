# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

3Bfreeze is a guided credit freeze management app. Users freeze/unfreeze credit at Equifax, TransUnion, and Experian through step-by-step workflows. There's also an anonymous `/breach/[code]` flow for breach victims that works without authentication.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (flat config, Next.js preset)
npm start        # Serve production build
```

No test framework is set up. No Prettier — only ESLint.

Database migrations are in `supabase/migrations/` and applied with `npx supabase db push`.

## Environment

Requires `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

**Next.js 16 App Router** with Supabase (PostgreSQL + Auth) as the entire backend. No ORM — uses `@supabase/supabase-js` client directly. No Server Actions — all mutations go through the Supabase browser client from Client Components.

### Data Flow Pattern

Every authenticated page follows the same pattern:
1. **Server Component** (`src/app/(app)/*/page.tsx`) fetches data via `createServerClient` from `@/lib/supabase/server`
2. Passes data as props to a **Client Component** (`src/components/*-client.tsx`) that handles all interactivity and mutations

### Route Groups

- `src/app/(app)/` — Authenticated routes (dashboard, freeze-workflow, unfreeze-workflow, history, settings). Shares a layout with `AppNav` + sidebar. Protected by middleware.
- `src/app/breach/` — Public anonymous flow. State persisted in `localStorage` via `lib/breach-workflow-storage.ts`.
- Root-level pages (`/login`, `/signup`, `/about`, etc.) — Public marketing/auth pages.

### Auth

Supabase Auth with cookie-based sessions via `@supabase/ssr`. Middleware at `src/middleware.ts` delegates to `lib/supabase/middleware.ts` which refreshes sessions and handles redirects:
- Unauthenticated users on protected routes → `/login`
- Authenticated users on auth pages → `/dashboard`
- Public paths: `/`, `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`, `/about`, `/contact`, `/privacy`, `/terms`, `/auth/**`, `/breach/**`

Two Supabase client helpers:
- `lib/supabase/client.ts` — browser client (Client Components)
- `lib/supabase/server.ts` — server client (Server Components, Route Handlers)

### Database

PostgreSQL via Supabase with RLS on all tables. Key tables: `users`, `bureau_status`, `thaw_reminders`, `freeze_workflow_progress`, `freeze_issues`, `activity_log`, `contact_submissions`, `notification_preferences`. A trigger auto-creates a `users` row on signup.

### Styling

Tailwind CSS v4 with `@tailwindcss/postcss`. Design tokens as CSS custom properties in `oklch` color space in `globals.css`. shadcn/ui components in `src/components/ui/`. Animation wrappers (`FadeUp`, `FadeIn`, `StaggerChildren`) in `src/components/animate.tsx`.

### Key Types

All shared types and the `BUREAU_INFO` config constant live in `src/lib/types.ts`. The three bureaus (`equifax`, `transunion`, `experian`) are the core domain model.

## Git Hooks

A `pre-push` hook blocks tag pushes unless `CHANGELOG.md` has a matching `## [vX.Y.Z]` entry.

## Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
