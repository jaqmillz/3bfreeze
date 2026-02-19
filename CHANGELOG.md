# Changelog

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
