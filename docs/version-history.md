# 3Bfreeze — Version History

**Product**: 3Bfreeze — Credit Freeze Management Tool
**Website**: 3bfreeze.vercel.app
**Last Updated**: February 20, 2026

---

## v2.2.0 — February 20, 2026

### Admin Dashboard & Anonymous Freeze Tracking

**What was added**

- Full analytics dashboard at `/admin` with stat cards, activity trends, bureau breakdown, signup source breakdown, and breach code performance table
- Breach code management UI — create, edit, and activate/deactivate breach codes from the admin panel instead of editing source code
- Anonymous freeze event tracking — server-side recording of freeze completions for users who haven't signed up
- Conversion funnel visualization: Page Visits → Froze 1+ Bureau → All 3 Frozen → Signed Up
- Aggregate freeze session panel covering both anonymous and authenticated users
- CSV export of breach code performance metrics
- shadcn/ui chart components replacing custom Recharts wrappers

**Why this version exists**

Prior to v2.2.0, there was no way to see how the product was performing without running SQL directly against the database. Breach codes were hardcoded in TypeScript, meaning any new breach required a code deploy. Most critically, the majority of users — those who froze their credit without creating an account — were completely invisible to analytics. This version closes that data gap, gives operators a self-service admin panel, and makes breach code management a UI operation instead of an engineering task.

**Database changes**: Migration 005 (breach_codes table), Migration 006 (breach_freeze_events table)
**Environment variables**: `ADMIN_EMAILS`, `SUPABASE_SERVICE_ROLE_KEY`

---

## v2.1.0 — February 19, 2026

### Anonymous Freeze Flow & Breach Analytics

**What was added**

- Public `/freeze` route — anyone can freeze their credit without creating an account
- Breach visit analytics — anonymous tracking of page visits per breach code (no PII)
- Signup source attribution: breach code, direct freeze, or organic
- Breach code entry directly from the homepage
- Automatic localStorage-to-database migration when anonymous users later sign up or log in
- PWA icons (192x192, 512x512) with navy blue snowflake branding

**Security fixes in this release**

- Closed open redirect vulnerability in auth callback
- Fixed middleware exposing `/freeze-workflow` as a public route
- Added input validation (email regex, DB text length constraints)
- Added rate limiting on breach-visit API
- Redirected unrecognized breach codes to homepage

**Why this version exists**

The original product required account creation before users could do anything. When sharing 3Bfreeze with breach-affected populations, that friction was a dealbreaker — people arriving from a breach notification want to freeze immediately, not fill out a registration form. v2.1.0 removed that barrier by letting anyone freeze without an account, then prompting signup at the end. The breach analytics layer was added so we could measure conversion from breach landing pages through to completed freezes.

**Database changes**: Migration 004 (text length constraints)

---

## v2.0.2 — February 18, 2026

### Homepage Polish & Dashboard Additions

**What was added**

- Streamlined homepage: removed card containers from "How it works" and "Freeze vs Monitor" for seamless page flow
- "Protect Yourself" section on the authenticated dashboard with links to credit reports, fraud alerts, and monitoring services
- Collapsible breach hero banner that shrinks to a compact bar during the workflow
- Auto-scroll stepper to top on step change
- Pre-push git hook enforcing changelog entries before version tag pushes

**Why this version exists**

User feedback indicated the homepage felt boxy and segmented. This release smoothed the visual flow and added practical resources to the dashboard so users had clear next steps beyond just freezing. The collapsible breach hero solved a screen-real-estate problem on mobile where the breach info banner consumed too much space during the multi-step freeze workflow.

---

## v2.0.1 — February 17, 2026

### Breach Code Error Handling

**What was added**

- Inline error message with "Sign Up Instead" button when an invalid breach code is entered
- Auto-focus on breach code input after animation completes

**Why this version exists**

Users arriving at the breach code entry with a typo or expired code saw no feedback. This quick patch added clear error messaging and a fallback path so users weren't stuck on a dead-end screen.

---

## v2.0 — February 17, 2026

### Breach Landing Pages & Navy Blue Redesign

**What was added**

- Breach-specific landing pages at `/breach/{code}` with tailored messaging per data breach
- Breach code entry flow for sharing targeted freeze links with affected populations
- Anonymous freeze workflow accessible without an account
- Complete visual redesign with navy blue color palette
- Mobile layout fix for action links alignment

**Why this version exists**

v2.0 was a strategic pivot. The original product was a general-purpose credit freeze tool. After researching distribution channels, we identified data breach notifications as the highest-intent moment to reach users. v2.0 added the ability to create breach-specific landing pages (e.g., `/breach/HEALTH2024`) that could be included in breach notification letters, giving affected individuals a direct, branded path to freeze their credit. The navy blue palette replaced the purple theme to convey trust and authority — appropriate for a financial security product.

---

## v1.2.1 — February 15, 2026

### OAuth Simplification

**What was added**

- Removed Apple OAuth, keeping Google as the sole OAuth provider

**Why this version exists**

Apple OAuth required a paid Apple Developer account ($99/year) and added sign-in complexity with minimal adoption. Removing it simplified the auth flow and reduced maintenance surface.

---

## v1.2 — February 14, 2026

### Terminology & Onboarding

**What was added**

- Renamed "thaw" to "unfreeze" throughout the entire application
- First-login redirect to the freeze workflow so new users land on the core action
- General UX polish

**Why this version exists**

User testing revealed that "thaw" was confusing — people didn't immediately connect it with lifting a credit freeze. "Unfreeze" is the term used by the credit bureaus themselves. The first-login redirect ensured new users didn't land on an empty dashboard wondering what to do next.

---

## v1.1.1 — February 13, 2026

### Visual Refinement

**What was added**

- Thinner header (64px → 48px)
- Hero section line break adjustments
- General homepage cleanup

**Why this version exists**

The header was consuming too much vertical space, especially on smaller screens. This micro-release tightened the layout proportions before the next feature release.

---

## v1.1 — February 13, 2026

### Dashboard Redesign, SEO & Temporary Thaw Tracking

**What was added**

- Temporary thaw (unfreeze) tracking with date-aware status computation — the dashboard auto-detects when a temporary thaw window expires and flips status back to frozen
- "Set at bureau" vs. "app reminder" distinction for thaw entries
- "Already frozen" flow with a "Continue" button instead of redundant "Confirm freeze"
- Complete dashboard visual overhaul: sharper borders, visual dividers, overhauled info cards (6 research-backed cards replacing generic set)
- Text link actions replacing button-style freeze/thaw controls
- Deep purple/indigo color palette
- Plus Jakarta Sans font replacing Geist
- Full SEO suite: llms.txt, robots.txt, dynamic sitemap, Open Graph image, Apple touch icon, PWA manifest, OG tags, Twitter cards
- Dead code cleanup and shared utility extraction

**Why this version exists**

v1.0 tracked whether bureaus were frozen but couldn't handle temporary unfreezes (e.g., unfreezing Equifax for 3 days to apply for a mortgage). v1.1 added date-window-aware tracking so the dashboard always shows the correct current status. The SEO suite was necessary for organic discovery — without it, the site was invisible to search engines and link previews showed nothing when shared. The visual overhaul established the product's design language.

---

## v1.0 — Initial Release

### Core Product

**What was added**

- Credit freeze/unfreeze workflows for Equifax, TransUnion, and Experian
- Dashboard with per-bureau status tracking
- Activity history log
- User settings
- Authentication: signup, login, password reset, Google OAuth
- Landing page, about, privacy policy, terms of service, contact form

**Why this version exists**

v1.0 is the minimum viable product. Credit freezes are the single most effective step consumers can take to prevent identity theft, but the process requires visiting three separate bureau websites with different interfaces. 3Bfreeze provides a single guided workflow that walks users through all three freezes, tracks completion status, and maintains a history of changes — turning a fragmented, confusing process into a straightforward checklist.

---

*Document generated February 20, 2026*
