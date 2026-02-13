# Three-Bureau Credit Freeze — Frontend Page & Modal Specification

## Tech Stack Context
- Next.js (App Router)
- Tailwind CSS + shadcn/ui
- Supabase Auth + Supabase PostgreSQL
- All pages are responsive (mobile-first, desktop-friendly)
- All authenticated pages redirect to /login if no session
- All unauthenticated pages redirect to /dashboard if session exists

---

## /

**Page Name:** Landing / Homepage

**Purpose:** Marketing page. Converts visitors into signups. Explains the product value proposition.

**Layout:**
- Top navigation bar with logo, "How It Works" anchor link, "Pricing" anchor link, "Login" button, "Get Started" CTA button
- Hero section: headline ("Take Control of Your Credit Files"), subheadline explaining freeze vs monitoring, primary CTA button ("Start Freezing — Free"), secondary CTA ("Learn How It Works")
- "How It Works" section: 3-step visual (1. Create account, 2. Follow guided freeze workflow, 3. Track your freeze status). Each step has an icon, title, and one-sentence description
- "Why Freeze?" section: brief comparison of freeze vs monitoring. Two columns — left column "Credit Monitoring" with pain points, right column "Credit Freeze" with benefits
- Statistics banner: "230M Americans at risk", "1.1M+ identity theft cases in 2024", "Only 10% have an active freeze"
- "Who It's For" section: breach victims, proactive consumers, seniors, anyone concerned about identity theft
- Pricing section (if applicable) or "Free to get started" messaging
- Footer: logo, links to /about, /privacy, /terms, /contact, copyright

**Modals:** None

**Navigation:** Clicking "Get Started" or primary CTA routes to /signup

---

## /login

**Page Name:** Login

**Purpose:** Authenticate existing users.

**Layout:**
- Centered card on minimal background
- Logo at top of card
- Email input field
- Password input field
- "Log In" button (primary)
- "Forgot password?" link below button, routes to /forgot-password
- Divider with "or"
- "Continue with Google" OAuth button
- "Continue with Apple" OAuth button
- Footer text: "Don't have an account? Sign up" with link to /signup

**States:**
- Default: empty form
- Loading: button shows spinner on submit
- Error: inline error message below form ("Invalid email or password")
- Rate limited: message after too many failed attempts

**Modals:** None

---

## /signup

**Page Name:** Create Account

**Purpose:** Register new users.

**Layout:**
- Centered card on minimal background
- Logo at top of card
- First name input field
- Last name input field
- Email input field
- Password input field (with strength indicator)
- Confirm password input field
- Checkbox: "I agree to the Terms of Service and Privacy Policy" (links to /terms and /privacy)
- "Create Account" button (primary)
- Divider with "or"
- "Continue with Google" OAuth button
- "Continue with Apple" OAuth button
- Footer text: "Already have an account? Log in" with link to /login

**States:**
- Default: empty form
- Validation: inline field-level errors (email format, password mismatch, password too weak, terms not accepted)
- Loading: button shows spinner on submit
- Success: redirects to /verify-email

**Modals:** None

---

## /verify-email

**Page Name:** Email Verification Pending

**Purpose:** Inform user to check their email after signup.

**Layout:**
- Centered card
- Mail icon/illustration
- Headline: "Check Your Email"
- Body text: "We sent a verification link to {email}. Click the link to activate your account."
- "Resend Email" button (secondary, with cooldown timer after click)
- "Back to Login" link

**States:**
- Default: awaiting verification
- Resent: confirmation message "Verification email resent"
- Cooldown: "Resend Email" button disabled with countdown (60 seconds)

**Modals:** None

---

## /forgot-password

**Page Name:** Forgot Password

**Purpose:** Initiate password reset flow.

**Layout:**
- Centered card
- Headline: "Reset Your Password"
- Body text: "Enter your email and we'll send you a reset link."
- Email input field
- "Send Reset Link" button (primary)
- "Back to Login" link

**States:**
- Default: empty form
- Loading: spinner on button
- Success: message "If an account exists with that email, you'll receive a reset link." (does not confirm account existence)
- Error: inline error for invalid email format

**Modals:** None

---

## /reset-password

**Page Name:** Reset Password

**Purpose:** Set new password via token from email link.

**Layout:**
- Centered card
- Headline: "Set a New Password"
- New password input field (with strength indicator)
- Confirm new password input field
- "Reset Password" button (primary)

**States:**
- Default: empty form
- Invalid/expired token: message "This reset link has expired. Please request a new one." with link to /forgot-password
- Validation: inline errors for password mismatch, weakness
- Success: message "Password updated successfully" with "Go to Login" button routing to /login

**Modals:** None

---

## /dashboard

**Page Name:** Dashboard

**Purpose:** Primary authenticated view. Shows freeze status across all three bureaus and quick actions.

**Layout:**
- Top navigation bar: logo, "Dashboard" (active), "Freeze Workflow", "Settings", user avatar/name dropdown
- Welcome banner: "Welcome back, {first_name}" with brief status summary sentence ("2 of 3 bureaus frozen")
- Three bureau status cards in a row (stacked on mobile):
  - Each card shows: bureau logo (Equifax, TransUnion, Experian), freeze status badge (Frozen / Not Frozen / Thaw Scheduled), date frozen (if applicable), date of last status update
  - Each card has actions: "Update Status" button, "Go to Bureau Site" external link button
  - If thaw is scheduled: shows thaw window dates and "Cancel Thaw" button
- Progress indicator: visual bar or ring showing "2 of 3 Bureaus Frozen"
- Quick actions section:
  - "Start Freeze Workflow" button (routes to /freeze-workflow) — shown prominently if any bureau is not frozen
  - "Schedule a Temporary Thaw" button — opens Schedule Thaw Modal
  - "View Freeze History" link (routes to /history)
- Upcoming reminders section: list of pending reminders (e.g., "Re-freeze reminder for Equifax on March 15")
- Tips/education card: rotating tip about credit security (optional, low priority)

**Modals:**

### Update Status Modal
- Triggered by: "Update Status" button on a bureau card
- Content: bureau name and logo at top, radio buttons or toggle ("Frozen" / "Not Frozen"), optional date picker for "Date frozen" or "Date unfrozen", "Save" button, "Cancel" button
- On save: updates bureau status in database, refreshes dashboard card

### Schedule Thaw Modal
- Triggered by: "Schedule a Temporary Thaw" button
- Content: checkbox or multi-select for which bureau(s) to thaw, date picker for thaw start date, date picker for thaw end date (or duration selector: 1 day, 3 days, 1 week, custom), note text: "Remember: you will need to unfreeze directly on each bureau's website. We'll send you a reminder to re-freeze.", "Schedule Reminder" button, "Cancel" button
- On save: creates scheduled reminder entries, shows confirmation
- Does NOT actually unfreeze anything — it schedules email/notification reminders

### Cancel Thaw Modal
- Triggered by: "Cancel Thaw" button on bureau card with active thaw
- Content: confirmation text "Cancel the scheduled thaw reminder for {bureau}?", "Yes, Cancel" button, "Never mind" button
- On confirm: deletes the scheduled reminder, refreshes card

---

## /freeze-workflow

**Page Name:** Freeze Workflow

**Purpose:** Guided step-by-step process to freeze all three bureaus.

**Layout:**
- Top navigation bar (same as dashboard)
- Stepper/progress indicator at top showing all steps: 1. Pre-Flight Checklist → 2. Equifax → 3. TransUnion → 4. Experian → 5. Completion
- Content area changes per step (below)
- "Back" and "Next" / "Continue" buttons at bottom of each step
- "Save & Exit" link to return to dashboard (progress is saved)

### Step 1: Pre-Flight Checklist (/freeze-workflow/checklist)
- Headline: "Before You Start"
- Checklist of items the user should have ready, each with a checkbox:
  - Social Security Number
  - Date of birth
  - Current mailing address
  - Email address
  - Phone number
  - Government-issued ID (some bureaus may ask)
  - Answers to identity verification questions (previous addresses, loan amounts, etc.)
- Info callout box: "Each bureau will ask you to create an account and verify your identity. The process takes about 5-10 minutes per bureau."
- "I Have Everything Ready" button (enabled when all checkboxes are checked, or allow skipping with warning)

### Step 2: Equifax (/freeze-workflow/equifax)
- Headline: "Freeze Your Equifax Credit File"
- Bureau logo
- Numbered instructions:
  1. Click the link below to open the Equifax freeze page
  2. Create a myEquifax account (or log in if you have one)
  3. Navigate to "Place a Security Freeze"
  4. Follow their identity verification steps
  5. Confirm the freeze is placed
- Prominent external link button: "Open Equifax Freeze Page" (opens https://www.equifax.com/personal/credit-report-services/credit-freeze/ in new tab)
- Tip callout: "Equifax may try to upsell you on monitoring services. You do not need to purchase anything. The freeze is free."
- After returning: "Did you successfully freeze your Equifax credit file?" with "Yes, It's Frozen" button and "I Had Issues" button
- "Yes" updates status to frozen with current timestamp
- "I Had Issues" opens Freeze Issue Modal

### Step 3: TransUnion (/freeze-workflow/transunion)
- Same layout as Step 2, adapted for TransUnion
- External link: "Open TransUnion Freeze Page" (opens https://www.transunion.com/credit-freeze in new tab)
- Instructions reference TransUnion Service Center account creation
- Tip callout: "TransUnion may offer a paid credit lock service. Decline this — the free credit freeze provides the same protection."

### Step 4: Experian (/freeze-workflow/experian)
- Same layout as Step 2, adapted for Experian
- External link: "Open Experian Freeze Page" (opens https://www.experian.com/freeze/center.html in new tab)
- Instructions reference Experian account creation
- Tip callout: "Experian will promote CreditWorks and CreditLock subscriptions. You do not need these. The security freeze is free by law."

### Step 5: Completion (/freeze-workflow/complete)
- Headline: "Freeze Workflow Complete"
- Summary card showing status of each bureau (Frozen / Not Frozen / Had Issues)
- If all three frozen: success illustration, congratulatory message, "Your credit files are now protected across all three bureaus."
- If some not frozen: message encouraging user to return and complete, with links back to the relevant step
- "Save Your Bureau Logins" callout: "We recommend saving your Equifax, TransUnion, and Experian login credentials in your browser's password manager or a dedicated password manager like 1Password or Bitwarden. You'll need these to unfreeze later."
- "Go to Dashboard" button

**Modals:**

### Freeze Issue Modal
- Triggered by: "I Had Issues" button on any bureau step
- Content: "What went wrong?" with selectable options:
  - "I couldn't verify my identity"
  - "The site had an error"
  - "I was asked to pay (freeze should be free)"
  - "I got confused during the process"
  - "Other"
- Optional free-text field for details
- "Skip This Bureau For Now" button (marks as not frozen, allows continuing to next step)
- "Try Again" button (dismisses modal, stays on current step)
- Issue data is stored for product analytics

---

## /history

**Page Name:** Freeze History / Activity Log

**Purpose:** Chronological log of all freeze/unfreeze actions and status changes.

**Layout:**
- Top navigation bar
- Headline: "Freeze History"
- Filter controls: filter by bureau (All, Equifax, TransUnion, Experian), filter by action type (All, Frozen, Unfrozen, Thaw Scheduled, Thaw Cancelled)
- Timeline/list of events, each showing:
  - Date and time
  - Bureau name and logo
  - Action ("Marked as Frozen", "Marked as Unfrozen", "Thaw Reminder Scheduled for March 15-18", "Thaw Reminder Cancelled")
  - Source ("Freeze Workflow", "Manual Update", "Scheduled Thaw")
- Empty state if no history: "No activity yet. Start the freeze workflow to begin."

**Modals:** None

---

## /settings

**Page Name:** Account Settings

**Purpose:** Manage account profile, notification preferences, and account actions.

**Layout:**
- Top navigation bar
- Sidebar or tab navigation with sections: Profile, Notifications, Security, Account

### Profile Tab (/settings/profile)
- First name input (editable)
- Last name input (editable)
- Email display (read-only, with "Change Email" button triggering Change Email Modal)
- "Save Changes" button

### Notifications Tab (/settings/notifications)
- Toggle switches:
  - "Re-freeze reminders" (email) — on/off
  - "Thaw window expiration alerts" (email) — on/off
  - "Weekly freeze status summary" (email) — on/off
  - "Security alerts" (email, e.g., password changes) — on/off, default on
- "Save Preferences" button

### Security Tab (/settings/security)
- "Change Password" button (opens Change Password Modal)
- Active sessions list (optional, low priority): shows devices/browsers with "Sign Out" per session
- "Sign Out All Devices" button

### Account Tab (/settings/account)
- "Export My Data" button (triggers data export, sends CSV/JSON via email)
- "Delete Account" button (opens Delete Account Modal)
- Danger zone styling for delete section

**Modals:**

### Change Email Modal
- Current email displayed
- New email input field
- Password confirmation input field (verify identity)
- "Update Email" button
- On success: sends verification to new email, message "Check your new email to confirm the change"

### Change Password Modal
- Current password input field
- New password input field (with strength indicator)
- Confirm new password input field
- "Update Password" button
- On success: confirmation message, optionally sign out other sessions

### Delete Account Modal
- Warning text: "This will permanently delete your account and all associated data. This action cannot be undone. Your credit freezes at the bureaus will remain in place — we do not control those."
- Type "DELETE" to confirm input field
- "Delete My Account" button (destructive/red)
- "Cancel" button
- On confirm: deletes account, signs out, redirects to /

---

## /privacy

**Page Name:** Privacy Policy

**Purpose:** Legal page. Required.

**Layout:**
- Top navigation bar (minimal — logo + back to home)
- Standard long-form legal text content
- Last updated date at top

**Modals:** None

---

## /terms

**Page Name:** Terms of Service

**Purpose:** Legal page. Required.

**Layout:**
- Same layout as /privacy
- Standard long-form legal text content
- Last updated date at top

**Modals:** None

---

## /about

**Page Name:** About

**Purpose:** Company/product background. Builds trust.

**Layout:**
- Top navigation bar
- Mission statement section
- Why we built this / the problem with credit monitoring
- Team section (optional, depends on what the founder wants public)
- Contact information or link to /contact

**Modals:** None

---

## /contact

**Page Name:** Contact

**Purpose:** Support and inquiries.

**Layout:**
- Top navigation bar
- Headline: "Get in Touch"
- Contact form: name, email, subject dropdown (General Inquiry, Bug Report, Partnership Inquiry, Other), message textarea, "Send" button
- Alternative contact info (email address, if applicable)

**States:**
- Default: empty form
- Loading: spinner on button
- Success: "Message sent. We'll get back to you within 1-2 business days."
- Error: "Something went wrong. Please try again or email us directly at {email}."

**Modals:** None

---

## /404

**Page Name:** Not Found

**Purpose:** Catch-all for invalid routes.

**Layout:**
- Centered content
- "Page Not Found" headline
- Brief message: "The page you're looking for doesn't exist or has been moved."
- "Go to Homepage" button (unauthenticated) or "Go to Dashboard" button (authenticated)

**Modals:** None

---

## Global Components (Present on All Authenticated Pages)

### Top Navigation Bar
- Logo (links to /dashboard)
- Nav links: Dashboard, Freeze Workflow, Settings
- User dropdown (avatar + name): "Settings", "Sign Out"
- Mobile: hamburger menu with same items

### Session Expiration Modal
- Triggered by: Supabase session timeout
- Content: "Your session has expired. Please log in again."
- "Log In" button (routes to /login)
- Automatically shown as overlay, blocks interaction

### Global Toast/Notification System
- Position: top-right or bottom-right
- Used for: success confirmations ("Status updated"), errors ("Failed to save"), info messages ("Reminder scheduled")
- Auto-dismisses after 5 seconds, manually dismissable

---

## Database Tables Implied by This Spec

For reference when building the backend:

- **users** — id, email, first_name, last_name, created_at, updated_at (managed by Supabase Auth + profile table)
- **bureau_status** — id, user_id, bureau (equifax/transunion/experian), status (frozen/not_frozen), status_updated_at, frozen_date, notes
- **thaw_reminders** — id, user_id, bureau, thaw_start_date, thaw_end_date, reminder_sent, created_at, cancelled_at
- **freeze_workflow_progress** — id, user_id, current_step, checklist_completed, equifax_completed, transunion_completed, experian_completed, completed_at
- **freeze_issues** — id, user_id, bureau, issue_type, issue_details, created_at
- **activity_log** — id, user_id, bureau, action, source, created_at
- **contact_submissions** — id, name, email, subject, message, created_at
- **notification_preferences** — id, user_id, refreeze_reminders, thaw_expiration_alerts, weekly_summary, security_alerts
