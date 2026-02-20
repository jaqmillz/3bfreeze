# Changelog

## [v2.2.1] — 2026-02-20

- Remove unused imports (XCircle, Loader2) from workflow components
- Delete unused Next.js template SVGs from public/ (vercel.svg, globe.svg, next.svg, file.svg, window.svg)
- Remove stale binary docs (moved to Google Drive)
- Add technical specs and version history documentation
- Add docs/*.pdf and docs/*.pptx to .gitignore

## [v2.2.0] — 2026-02-20

### Features
- **Admin dashboard**: Full analytics dashboard at `/admin` with stats cards, activity trends, bureau breakdown donut, signup sources bar chart, and breach code performance table with expandable per-code funnels
- **Breach code management**: CRUD interface for breach codes at `/admin/breaches` — create, edit, activate/deactivate breach codes from the UI instead of hardcoded TypeScript
- **Anonymous freeze event tracking**: New `breach_freeze_events` table and `/api/breach-freeze` endpoint track freeze completions server-side for anonymous users, closing the data gap where users who froze without signing up were invisible to analytics
- **Conversion funnel**: Breach funnel shows Visits → Froze 1+ → All 3 Frozen → Signed Up (matching the actual user flow where signup happens after freezing)
- **Overall freeze sessions panel**: Shows aggregate freeze stats across all users including anonymous sessions and direct (non-breach-code) visitors
- **shadcn/ui charts**: Replaced custom Recharts code with shadcn ChartContainer/ChartTooltip components for consistent theming
- **Trailing-day trends**: Activity trends default to 14-day view with 7d/14d/30d/90d picker, filling zero-days for continuous x-axis
- **CSV export**: Export breach code performance data with full funnel metrics

### Infrastructure
- **Migration 005**: `breach_codes` table — moves breach codes from hardcoded TS to database with RLS
- **Migration 006**: `breach_freeze_events` table — anonymous freeze tracking with unique constraint deduplication
- **Service role client**: `createServiceClient()` for admin queries bypassing RLS
- **Admin auth**: Env var `ADMIN_EMAILS` checked in middleware, non-admins redirected to `/dashboard`
- **Session ID**: Persistent `crypto.randomUUID()` in localStorage for anonymous freeze event deduplication
- **Breach codes async**: `getBreachByCode()` now queries DB instead of hardcoded constant

## [v2.1.0] — 2026-02-19

### Features
- **Anonymous /freeze flow**: New public route lets anyone freeze credit without an account, with signup prompt at completion
- **Breach analytics**: Anonymous visit tracking per breach code (no PII), signup attribution (breach/direct_freeze/organic)
- **Breach code entry on homepage**: Enter a breach code directly from the landing page
- **Workflow migration**: localStorage progress automatically migrates to DB on any auth path (login, signup, OAuth) — only logs history when status actually changes
- **PWA icons**: Dynamic 192x192 and 512x512 icon route handlers (navy blue snowflake)

### Security & Bug Fixes
- Fix open redirect vulnerability in auth callback (validate `next` param)
- Fix middleware matching `/freeze` prefix exposing `/freeze-workflow` as public
- Fix signup redirecting to dashboard instead of verify-email when confirmation required
- Fix app layout crash when user profile row doesn't exist (`.single()` → `.maybeSingle()`)
- Add email regex validation on contact form
- Add DB text length constraints on all unbounded text columns (migration 004)
- Add in-memory rate limiting on breach-visit API
- Add error logging to previously silent catch blocks
- Redirect unrecognized breach codes to homepage (or dashboard if logged in)

### Code Quality
- Remove duplicate migration logic from signup page (now handled by WorkflowMigrator)
- Remove unused imports (Loader2, Shield, Snowflake, Bell)
- Add /freeze to sitemap

## [v2.0.2] — 2026-02-18

- Strip card containers from homepage "How it works" and "Freeze vs Monitor" sections for seamless page integration
- Switch freeze-vs-monitor layout from grid to centered flex for proper alignment
- Update freeze-vs-monitor subtitle with specific credit-file-pulled phrasing
- Add "Also protect yourself" section to dashboard (credit reports, fraud alerts, monitoring links)
- Collapsible breach hero: collapses to compact bar during workflow, expandable via chevron
- Auto-scroll stepper to top on step change, shorten toast duration to 2s
- Add pre-push hook enforcing changelog entries before tag pushes

## [v2.0.1] — 2026-02-17

- Show inline error and "Sign Up Instead" button for invalid breach codes
- Focus breach code input after animation settles

## [v2.0] — 2026-02-17

- Breach landing page with breach code entry flow
- Anonymous freeze workflow (no account required)
- Navy blue color palette
- Fix mobile alignment for action links next to shield icon

## [v1.2.1] — 2026-02-15

- Remove Apple OAuth, keep Google-only sign-in

## [v1.2] — 2026-02-14

- Rename "thaw" to "unfreeze" throughout the app
- First-login redirect to freeze workflow
- UX polish

## [v1.1.1] — 2026-02-13

- Homepage polish: thinner header, hero line break, cleanup

## v1.1 — 2026-02-13

### Features
- **Temporary thaw tracking**: Log temporary thaw windows from the unfreeze workflow. Dashboard auto-computes status based on date windows (frozen → temporarily thawed → frozen).
- **Set at bureau vs. app reminders**: Distinguish bureau-confirmed thaws (affects displayed status) from app reminders (informational).
- **Already-frozen flow**: "Continue" button instead of "Confirm freeze" when a bureau is already frozen.

### Design
- **Dashboard redesign**: Sharper border-radius throughout, visual divider between bureau section and info section.
- **Info cards overhauled**: 6 research-backed cards covering key credit freeze facts, misconceptions, and statistics (replaces generic 4-card set).
- **Text link actions**: Freeze/Schedule thaw buttons replaced with cleaner text links with arrows.
- **New color palette**: Deep purple/indigo theme (#17153B, #2E236C, #433D8B, #C8ACD6).
- **Plus Jakarta Sans font**: Replaced Geist with Plus Jakarta Sans for a more formal look.
- **Thinner header**: Reduced from 64px to 48px, smaller logo.
- **Footer grid fix**: Consistent 4-column layout across breakpoints.
- **Tighter spacing**: Reduced vertical gaps and header-to-content padding.

### SEO & Discoverability
- **llms.txt**: LLM-readable site index for AI crawlers (ChatGPT, Claude, Perplexity).
- **robots.txt**: Crawler directives — allows public pages, blocks authenticated routes.
- **Dynamic sitemap**: Auto-generated sitemap.xml with all public pages.
- **Open Graph image**: Auto-generated branded preview card for link sharing (iMessage, Twitter, Slack).
- **Apple touch icon**: Generated snowflake-on-purple icon for iOS home screen.
- **PWA manifest**: Web app manifest for Add to Home Screen support.
- **Full metadata config**: OG tags, Twitter cards, apple web app settings.

### Code Quality
- **Dead code cleanup**: Removed unused files (progress.tsx, tabs.tsx), dead functions (formatRelativeDate, FreezeIssue type), unused CSS variables (sidebar, chart).
- **Shared utilities**: Extracted duplicate getPasswordStrength to shared utils.ts.
- **Private exports**: Made individual bureau logo components private.

## v1.0 — Initial Release

- Complete 3Bfreeze application
- Freeze/unfreeze workflows for Equifax, TransUnion, Experian
- Dashboard with bureau status tracking
- Activity history
- User settings
- Auth flows (signup, login, password reset)
- Landing page, about, privacy, terms, contact pages
