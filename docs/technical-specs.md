# 3Bfreeze — Technical Specifications

**Version**: 2.2.4
**Last Updated**: February 22, 2026

---

## Product Overview

3Bfreeze is a credit freeze management tool that guides users through freezing their credit at all three major bureaus (Equifax, TransUnion, Experian). It provides a unified workflow, status tracking, and breach-specific landing pages for targeted distribution.

---

## Addresses & Accounts

| Resource | URL / Location |
|----------|---------------|
| Production site | https://3bfreeze.vercel.app |
| Custom domain | https://3bfreeze.com |
| GitHub repository | github.com/jaqmillz/3bfreeze (private) |
| Supabase project | abchyewtkwkmdibzycki.supabase.co |
| Vercel project | vercel.com — Jack Miller's projects / 3bfreeze |
| Vercel team | jack-millers-projects-c0dac3b8 |

---

## Frontend

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5.x |
| React | 19.2.3 |
| Styling | Tailwind CSS 4.x with PostCSS |
| UI library | shadcn/ui (Radix UI primitives + CVA) |
| Charts | Recharts 2.15 via shadcn/ui ChartContainer |
| Animations | Framer Motion 12.x |
| Icons | Lucide React |
| Toasts | Sonner |
| Theming | next-themes (light/dark mode support) |
| Fonts | Plus Jakarta Sans (body), Geist Mono (code) |

### Key Frontend Patterns

- **Server Components by default** — pages fetch data server-side, pass to client components for interactivity
- **Route groups** — `(app)` for authenticated user pages, `(admin)` for admin panel
- **localStorage state** — anonymous freeze flow stores progress in browser storage, migrates to DB on account creation
- **Session IDs** — `crypto.randomUUID()` persisted in localStorage for anonymous event deduplication

---

## Backend

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js (Vercel serverless functions) |
| Framework | Next.js API routes + Server Components |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database client | @supabase/ssr (server), @supabase/supabase-js (service role) |
| Rate limiting | In-memory per-IP rate limiting on public API routes |

### API Routes

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/breach-visit` | POST | Public | Track anonymous breach page visits |
| `/api/breach-freeze` | POST | Public | Track anonymous freeze completions |
| `/api/breach-validate` | POST | Public | Validate a breach code, return breach info |
| `/api/admin/breach-codes` | GET/POST/PUT | Admin | CRUD operations on breach codes |

### Middleware

Next.js middleware (`src/lib/supabase/middleware.ts`) runs on every request and handles:

- Session refresh (Supabase cookie management)
- Auth gating — unauthenticated users redirected to `/login` on protected routes
- Public route allowlist — homepage, `/freeze`, `/breach/*`, `/api/*`, static pages
- Admin guard — `/admin` routes require email in `ADMIN_EMAILS` env var

---

## Database

| Component | Detail |
|-----------|--------|
| Provider | Supabase (hosted PostgreSQL) |
| Engine | PostgreSQL 15+ |
| Auth | Supabase Auth (auth.users managed by Supabase) |
| Security | Row Level Security (RLS) enabled on all tables |
| Migrations | 6 sequential SQL files in `supabase/migrations/` |

### Tables

| Table | Purpose | RLS Policy |
|-------|---------|------------|
| `users` | User profiles (extends auth.users) | Own-row CRUD |
| `bureau_status` | Per-bureau freeze status per user | Own-row CRUD |
| `activity_log` | History of freeze/unfreeze actions | Own-row read/insert |
| `freeze_workflow_progress` | Multi-step workflow state | Own-row CRUD |
| `thaw_reminders` | Scheduled temporary unfreeze windows | Own-row CRUD |
| `freeze_issues` | User-reported problems during freeze | Own-row read/insert |
| `notification_preferences` | Email/alert preferences | Own-row read/insert/update |
| `contact_submissions` | Public contact form entries | Public insert only |
| `breach_codes` | Breach code definitions (name, description, data exposed) | Public read (active only) |
| `breach_visits` | Anonymous page visit tracking per breach code | Public insert only |
| `breach_freeze_events` | Anonymous freeze completion tracking | Public insert only |

### Migrations

| Migration | Description |
|-----------|-------------|
| 001 | Initial schema: users, bureau_status, activity_log, workflows, contacts |
| 002 | Add `set_at_bureau` flag to thaw reminders |
| 003 | Breach analytics: breach_visits table, signup_source/signup_breach_code columns |
| 004 | Text length constraints on all unbounded text columns |
| 005 | breach_codes table (moved from hardcoded TypeScript) |
| 006 | breach_freeze_events table for anonymous freeze tracking |

### Service Role Access

Admin queries use a separate Supabase client (`createServiceClient()` in `src/lib/supabase/admin.ts`) with the `SUPABASE_SERVICE_ROLE_KEY`. This bypasses RLS for cross-user analytics. Only used in server components within the `(admin)` route group.

---

## Hosting & Deployment

| Component | Detail |
|-----------|--------|
| Platform | Vercel (Hobby plan) |
| Deploy method | Auto-deploy on push to `main` branch |
| Build | `next build` (Vercel auto-detects Next.js) |
| Region | Vercel default (US East) |
| CDN | Vercel Edge Network |
| DNS / Domain | Cloudflare (3bfreeze.com proxied to Vercel) |

### Environment Variables (Vercel)

| Variable | Sensitivity | Environments |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Sensitive | Production, Preview |
| `ADMIN_EMAILS` | Non-sensitive | Production, Preview, Development |

---

## Authentication

| Feature | Implementation |
|---------|---------------|
| Email/password | Supabase Auth with email verification |
| OAuth | Google sign-in |
| Session management | Supabase SSR cookies, refreshed in middleware |
| Admin access | `ADMIN_EMAILS` env var checked in middleware + layout |
| Password reset | Supabase auth flow (`/forgot-password` → `/reset-password`) |

### Auth Flow

1. User signs up via email/password or Google OAuth
2. Supabase creates `auth.users` row, triggers `handle_new_user()` to create `public.users` profile
3. Middleware reads session cookie on each request, refreshes if needed
4. Protected routes redirect to `/login` if no session
5. Admin routes additionally verify email against `ADMIN_EMAILS`

---

## SEO & Discoverability

| Feature | File |
|---------|------|
| Dynamic sitemap | `src/app/sitemap.ts` |
| PWA manifest | `src/app/manifest.ts` |
| Open Graph image | `src/app/opengraph-image.tsx` (auto-generated) |
| Apple touch icon | `src/app/apple-icon.tsx` (auto-generated) |
| Metadata | Full OG tags, Twitter cards, Apple web app config in root layout |
| metadataBase | `https://3bfreeze.com` |

---

## Page Map

### Public Pages (no auth required)

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/freeze` | Anonymous credit freeze workflow |
| `/breach/[code]` | Breach-specific landing page |
| `/breach` | Breach code entry |
| `/login` | Sign in |
| `/signup` | Create account |
| `/about` | About page |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/forgot-password` | Password reset request |
| `/reset-password` | Set new password |
| `/verify-email` | Email verification landing |

### Authenticated Pages

| Route | Purpose |
|-------|---------|
| `/dashboard` | Bureau status overview + protect-yourself resources |
| `/freeze-workflow` | Guided freeze workflow (authenticated, state saved to DB) |
| `/unfreeze-workflow` | Guided unfreeze workflow |
| `/history` | Activity log |
| `/settings` | User preferences |

### Admin Pages

| Route | Purpose |
|-------|---------|
| `/admin` | Analytics dashboard (stats, funnels, charts, trends) |
| `/admin/breaches` | Breach code CRUD management |

---

## Security

| Measure | Detail |
|---------|--------|
| Row Level Security | Enabled on all tables — users can only access their own data |
| Service role isolation | Admin client is server-only, never imported in client components |
| Auth redirect validation | Open redirect vulnerability patched in auth callback |
| Input validation | Email regex, DB text length constraints (migration 004) |
| Rate limiting | In-memory per-IP limiting on public API endpoints |
| Admin guard | Two layers: middleware email check + layout server component check |
| HTTPS | Enforced by Vercel + Cloudflare |

---

## Source Control

| Detail | Value |
|--------|-------|
| Provider | GitHub (private repository) |
| SSH clone | `git@github.com:jaqmillz/3bfreeze.git` |
| HTTPS clone | `https://github.com/jaqmillz/3bfreeze.git` |
| Default branch | `main` |
| Visibility | Private |

### Access

The repository is hosted on GitHub under the `jaqmillz` account. To clone:

```
git clone git@github.com:jaqmillz/3bfreeze.git
```

Collaborators need to be added via GitHub repository settings (Settings → Collaborators).

### Version Tags

The project uses semantic versioning with git tags. Each release is tagged `v{major}.{minor}.{patch}`.

| Version | Meaning |
|---------|---------|
| Major (v1 → v2) | Significant product pivot or breaking changes |
| Minor (v2.1 → v2.2) | New features or capabilities |
| Patch (v2.0.1 → v2.0.2) | Bug fixes and polish |

Current version: **v2.2.4**

All versions: v1.0, v1.1, v1.1.1, v1.2, v1.2.1, v2.0, v2.0.1, v2.0.2, v2.1.0, v2.2.0, v2.2.1, v2.2.2, v2.2.3, v2.2.4

### Branching

All work is done on `main`. There is no staging or develop branch — the project deploys directly from `main`.

---

## Deployment Process

### How It Works

The app deploys automatically. The full flow:

1. **Push code to `main`** — `git push origin main`
2. **Vercel detects the push** — GitHub webhook triggers a Vercel build
3. **Vercel runs `next build`** — compiles the Next.js app, generates serverless functions
4. **Vercel deploys to production** — new version goes live at 3bfreeze.vercel.app and 3bfreeze.com
5. **Previous deployment preserved** — Vercel keeps deployment history for instant rollback

Typical build time: ~60 seconds.

### Manual Deploy

If needed, deploy without pushing to git:

```
vercel --prod
```

This deploys the local working directory directly to production.

### Rolling Back

If a deploy breaks something, roll back from the Vercel dashboard:
Deployments → find the last working deploy → three-dot menu → "Promote to Production"

### Release Checklist

When cutting a new version:

1. Update `version` in `package.json`
2. Add entry to `CHANGELOG.md`
3. Commit: `git commit -m "Release notes (vX.Y.Z)"`
4. Tag: `git tag vX.Y.Z`
5. Push: `git push origin main --tags`
6. Verify deployment at https://3bfreeze.vercel.app

A pre-push git hook enforces that any version tag has a corresponding `CHANGELOG.md` entry.

### Database Changes

Database migrations are not auto-deployed. When a release includes new migrations:

1. Add migration SQL file to `supabase/migrations/`
2. Run `supabase db push` to apply against the live Supabase instance
3. Then push code that depends on the new schema

Always run migrations **before** deploying code that references new tables or columns.

---

## Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server (http://localhost:3000) |
| `npm run build` | Production build (validates types and pages) |
| `npm run lint` | ESLint |
| `supabase db push` | Apply pending migrations to Supabase |
| `vercel --prod` | Manual production deploy |
| `vercel logs 3bfreeze.vercel.app` | Stream production logs |
| `vercel env ls` | List environment variables on Vercel |

### Local Setup

1. Clone the repo: `git clone git@github.com:jaqmillz/3bfreeze.git`
2. Install dependencies: `npm install`
3. Copy environment variables: create `.env.local` with Supabase keys and admin emails
4. Start dev server: `npm run dev`
5. Open http://localhost:3000

---

*Document generated February 22, 2026*
