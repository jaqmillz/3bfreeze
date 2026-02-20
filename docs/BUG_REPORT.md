# 3Bfreeze Bug Report — Chaos Monkey Audit

**Date:** 2026-02-19
**Scope:** Full-stack audit — routes, auth, components, API, database, security

---

## CRITICAL (3)

### BUG-001: Open Redirect in Auth Callback

**File:** `src/app/auth/callback/route.ts:7,13`
**Issue:** The `next` query parameter is used directly in `NextResponse.redirect()` without validation. An attacker can craft `?next=https://evil.com` to redirect authenticated users to a malicious domain after OAuth login.

```typescript
const next = searchParams.get("next") ?? "/dashboard";
// ...
return NextResponse.redirect(`${origin}${next}`);
```

**Impact:** Phishing attacks — users complete real OAuth then land on attacker-controlled site.
**Fix:** Validate that `next` starts with `/` and does NOT start with `//`.

---

### BUG-002: Middleware Treats `/freeze-workflow` as Public

**File:** `src/lib/supabase/middleware.ts:54`
**Issue:** `request.nextUrl.pathname.startsWith("/freeze")` matches both `/freeze` (public anonymous flow) AND `/freeze-workflow` (auth-protected). Unauthenticated users bypass the middleware redirect for `/freeze-workflow`.

```typescript
request.nextUrl.pathname.startsWith("/freeze")  // matches /freeze AND /freeze-workflow
```

**Impact:** The `(app)/layout.tsx` and `freeze-workflow/page.tsx` have secondary auth checks, so users still get redirected at the component level. But the middleware bypass means unnecessary server rendering and potential information leakage from the server component before redirect fires.
**Fix:** Change to exact match for `/freeze`:
```typescript
request.nextUrl.pathname === "/freeze" ||
request.nextUrl.pathname.startsWith("/freeze/")
```

---

### BUG-003: Signup Redirects to `/dashboard` Instead of `/verify-email`

**File:** `src/app/signup/page.tsx:226`
**Issue:** After `signUp()`, the code unconditionally does `router.push("/dashboard")`. If Supabase email confirmation is enabled, the user is NOT authenticated after signup. The middleware then redirects them to `/login` — skipping the verify-email page entirely. The user has no idea they need to check their email.

```typescript
router.push("/dashboard");  // should be "/verify-email"
```

**Impact:** Users never see the verify-email page. They see a confusing redirect to login. Workflow migration code (lines 131-224) is also silently skipped because `getUser()` returns null.
**Fix:** Check if session exists after signup. If not (email confirmation enabled), redirect to `/verify-email?email={email}` and store email in localStorage for the verify page.

---

## HIGH (3)

### BUG-004: Freeze Flow Migration Overwrites Breach Workflow Migration

**File:** `src/app/signup/page.tsx:153-220`
**Issue:** If a user has BOTH `breach_workflow_state` and `freeze_flow_state` in localStorage (e.g., they did the breach flow, went back, then did the generic freeze flow), both get migrated. But the freeze flow upsert (line 189) to `freeze_workflow_progress` OVERWRITES the breach workflow upsert (line 154) because they conflict on `user_id`.

**Impact:** Breach workflow progress lost. The freeze flow data replaces it.
**Fix:** Only migrate one — check for breach first (higher priority since it has a breach code), skip freeze migration if breach was migrated. Or merge the two states.

---

### BUG-005: No Rate Limiting on `/api/breach-visit`

**File:** `src/app/api/breach-visit/route.ts`
**Issue:** The endpoint has zero rate limiting. Anyone can spam it to inflate breach_visits counts or exhaust database storage. Since RLS allows anyone to INSERT, this is a wide-open write endpoint.

**Impact:** Analytics data corruption, database storage exhaustion, potential performance degradation.
**Fix:** Add rate limiting via headers/IP, or use Supabase edge functions with built-in rate limiting. At minimum, add a simple in-memory rate limiter.

---

### BUG-006: App Layout Crash on Missing User Profile

**File:** `src/app/(app)/layout.tsx:20-24`
**Issue:** The layout queries the `users` table with `.single()` which throws if no row exists. If a user authenticates (via OAuth or email) but the trigger that creates their profile row fails, the entire app layout crashes.

```typescript
const { data: profile } = await supabase
  .from("users")
  .select("first_name, last_name")
  .eq("id", user.id)
  .single();  // throws on 0 rows
```

**Impact:** Authenticated user locked out of entire app — dashboard, settings, everything under `(app)/`.
**Fix:** Use `.maybeSingle()` and handle null profile gracefully.

---

## MEDIUM (5)

### BUG-007: Missing PWA Icon Files

**File:** `src/app/manifest.ts:14-23`
**Issue:** The manifest references `/icon-192.png` and `/icon-512.png` which do not exist anywhere in the project (not in `/public`, not as generated routes). The `apple-icon.tsx` and `opengraph-image.tsx` exist but don't generate these specific files.

**Impact:** PWA "Add to Home Screen" broken. Console 404 errors on every page load. Lighthouse PWA audit fails.
**Fix:** Either generate the icons dynamically (like apple-icon.tsx) or add static PNG files to `/public`.

---

### BUG-008: Sitemap Missing New Routes

**File:** `src/app/sitemap.ts`
**Issue:** The sitemap does not include `/freeze` (new public anonymous flow route). It also doesn't include individual breach pages like `/breach/ACME2024`.

**Impact:** SEO — Google won't discover the freeze flow page or breach-specific pages via sitemap.
**Fix:** Add `/freeze` to the sitemap. Consider dynamically generating breach code URLs.

---

### BUG-009: Silent Error Swallowing in Breach Visit API

**File:** `src/app/api/breach-visit/route.ts:28-30`
**Issue:** The catch block returns 204 regardless of what went wrong — including malformed JSON, database errors, or Supabase outages. No errors are ever logged.

```typescript
catch {
  return new NextResponse(null, { status: 204 });
}
```

**Impact:** Database insert failures are completely invisible. You'll never know if analytics are being lost.
**Fix:** Log errors to console/monitoring. Return 204 to the client (don't expose internals), but log the actual error server-side.

---

### BUG-010: Contact Form — No Server-Side Email Validation

**File:** `src/components/contact-form.tsx`
**Issue:** The contact form relies on HTML `type="email"` for validation but performs no server-side email format check before inserting into `contact_submissions`. Direct Supabase client calls can bypass client-side validation.

**Impact:** Invalid/malicious emails stored in database. Could cause issues if contact submissions are later used for email replies.
**Fix:** Add email format validation before the Supabase insert.

---

### BUG-011: Database Text Fields Have No Length Constraints

**Files:**
- `supabase/migrations/001_initial_schema.sql:222-227` (contact_submissions: name, email, subject, message)
- `supabase/migrations/003_breach_analytics.sql:9` (breach_visits: breach_code)

**Issue:** All text columns are unbounded `text` type. Combined with the open insert policies (RLS allows anyone to INSERT), an attacker could store arbitrarily large strings.

**Impact:** Database storage exhaustion, potential performance issues on queries.
**Fix:** Add `varchar(N)` constraints or CHECK constraints. The API validates breach codes against known codes, which mitigates this for breach_visits (valid codes are short), but defense in depth at the DB level is warranted.

---

## LOW (4)

### BUG-012: Unused `Loader2` Import in freeze-flow-client.tsx

**File:** `src/components/freeze-flow-client.tsx:8`
**Issue:** `Loader2` is imported from lucide-react but never used. Likely a leftover from the fork of breach-workflow-client.tsx.
**Impact:** Dead code, minor bundle size impact.

---

### BUG-013: Sign Out Missing Error Handling

**File:** `src/components/app-nav.tsx`
**Issue:** `handleSignOut()` calls `supabase.auth.signOut()` and immediately navigates to `/login` without checking if signOut actually succeeded.
**Impact:** If signOut fails (network error), user is redirected to login but their session cookie persists, causing confusing behavior on next visit.

---

### BUG-014: Verify Email Page — Resend Button Broken Without Email

**File:** `src/app/verify-email/page.tsx:129`
**Issue:** The resend button is disabled when `!email`, but because the signup page redirects to `/dashboard` (BUG-003) instead of `/verify-email?email=...`, users who need this page can't resend because the email is never passed.
**Impact:** Depends on BUG-003 being present. If BUG-003 is fixed to redirect to `/verify-email?email=...`, this becomes a non-issue.

---

### BUG-015: Homepage `Icon` Variable Declared but Unused in Map

**File:** `src/app/page.tsx:118`
**Issue:** In the "How it works" section, each step destructures `icon: Icon` but `Icon` is never rendered — only `step` (the number) is shown in the circle. The icons are imported at the top of the file but serve no purpose.

```typescript
.map(({ step, icon: Icon, title, desc }) => (
  // Icon is never used in the JSX
```

**Impact:** Dead code. Icons imported but not rendered.

---

## Summary

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 3 | BUG-001, BUG-002, BUG-003 |
| HIGH | 3 | BUG-004, BUG-005, BUG-006 |
| MEDIUM | 5 | BUG-007, BUG-008, BUG-009, BUG-010, BUG-011 |
| LOW | 4 | BUG-012, BUG-013, BUG-014, BUG-015 |
| **Total** | **15** | |

## Priority Fix Order

1. **BUG-001** — Open redirect (security vulnerability, trivial fix)
2. **BUG-002** — Middleware public path leak (security, trivial fix)
3. **BUG-003** — Signup flow broken (user-facing, medium fix)
4. **BUG-006** — App layout crash (user-facing, trivial fix — change `.single()` to `.maybeSingle()`)
5. **BUG-004** — Double migration overwrite (data integrity, medium fix)
6. **BUG-005** — Rate limiting (abuse prevention, medium fix)
7. **BUG-007** — PWA icons (UX, quick fix)
8. **BUG-008** — Sitemap (SEO, quick fix)
9. **BUG-009** — Error logging (observability, quick fix)
10. Everything else
