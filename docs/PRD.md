# Three-Bureau Credit Freeze — Product Requirements Document

## Overview

A web application that guides consumers through freezing their credit files at all three major credit bureaus (Equifax, TransUnion, Experian), tracks freeze status, and sends reminders to re-freeze after temporary thaws. The product replaces confusion and fragmented bureau UX with a single, clear workflow.

## Problem Statement

Identity theft hit 1.1M+ cases in 2024. Credit freezes are the most effective prevention tool — they block access to credit files entirely, unlike monitoring which only alerts after access. Despite this, only ~10% of consumers have an active freeze. The bureaus make the process deliberately difficult: repeated identity challenges, upsell screens, no unified status view, and three separate websites with three separate accounts.

## Target Users

- Consumers affected by data breaches who need to freeze quickly
- Proactive individuals who want to protect their credit
- Seniors and low-credit-need consumers who rarely apply for credit
- B2B2C: companies managing breach remediation on behalf of affected users (Phase 3)

## Product Phases

### Phase 1: Web MVP
Guided freeze workflow, self-reported status tracking, user accounts, email reminders.

### Phase 2: Native Mobile App
iOS/Android app with biometric auth, credential storage, push notifications.

### Phase 3: Bureau Integration / B2B2C
Enterprise multi-tenancy, white-labeling, billing, API platform. Bureau API partnerships if available.

---

## Phase 1 Requirements (MVP)

### Functional Requirements

#### Authentication
- Email/password registration and login
- OAuth: Google and Apple sign-in
- Email verification on signup
- Password reset flow (forgot password → email link → set new password)
- Session management with automatic expiration

#### Guided Freeze Workflow
- Pre-flight checklist: confirms user has SSN, DOB, address, ID, email, phone
- Per-bureau steps (Equifax, TransUnion, Experian):
  - Clear numbered instructions specific to each bureau's process
  - External link to bureau's freeze page (opens in new tab)
  - Contextual tips warning about upsell screens and paid products
  - Confirmation prompt: "Did you successfully freeze?" (Yes / I Had Issues)
  - Issue reporting with categorized options for analytics
- Progress persistence: user can exit and resume where they left off
- Completion summary showing status of all three bureaus
- Credential save prompt: recommends saving bureau logins in browser password manager

#### Freeze Status Dashboard
- Per-bureau status cards showing: freeze status (Frozen / Not Frozen), date frozen, last updated
- Overall progress indicator (e.g., "2 of 3 Bureaus Frozen")
- Manual status update capability (user self-reports changes)
- All status is self-reported — no automated bureau status detection

#### Thaw Reminders
- User can schedule a temporary thaw window per bureau (start date, end date)
- System sends email reminder to unfreeze before thaw start date
- System sends email reminder to re-freeze when thaw window expires
- User can cancel scheduled thaw reminders

#### Activity History
- Chronological log of all status changes and actions
- Filterable by bureau and action type
- Records source of change (freeze workflow, manual update, scheduled thaw)

#### Notifications (Email)
- Signup confirmation / email verification
- Password reset
- Re-freeze reminders (thaw window expiration)
- Configurable preferences: user can toggle notification types on/off

#### Account Management
- Edit profile (first name, last name)
- Change email (with re-verification)
- Change password
- Export personal data
- Delete account (with confirmation)

### Non-Functional Requirements

#### Performance
- Page load under 2 seconds on 3G connection
- Dashboard loads freeze status in under 500ms

#### Security
- All data encrypted in transit (TLS) and at rest
- No storage of bureau credentials — app never touches bureau passwords
- Row-level security on all database tables (user can only access own data)
- Rate limiting on auth endpoints
- CSRF protection on all forms

#### Privacy
- Minimal PII collection: name, email only
- No SSN, DOB, or government ID stored — pre-flight checklist is informational only
- Privacy policy and terms of service required before launch
- GDPR-style data export and deletion capabilities

#### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader compatible
- Sufficient color contrast ratios

---

## Tech Stack

### Phase 1-2

| Layer | Technology |
|---|---|
| Frontend (Web) | Next.js (App Router), Tailwind CSS, shadcn/ui |
| Frontend (Phase 2 Mobile) | React Native / Expo |
| Backend / API | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Email | AWS SES or SendGrid |
| Scheduled Jobs | Vercel Cron |
| Hosting | Vercel |
| Monitoring | Sentry (errors), PostHog (analytics) |
| CI/CD | GitHub Actions |

### Phase 3 (When Required)

| Layer | Technology |
|---|---|
| Backend | Standalone Node.js (Express/Fastify) on AWS ECS/Fargate |
| Database | AWS RDS PostgreSQL |
| Auth | Auth0 (multi-tenant support) |
| IaC | AWS CloudFormation |
| CDN | CloudFront |
| Billing | Stripe |
| API Gateway | AWS API Gateway |

### Migration Path
- Supabase → RDS: standard pg_dump/pg_restore (same Postgres engine)
- Supabase Auth → Auth0: most complex migration; abstract auth behind service layer to isolate
- Vercel → ECS/Fargate: containerize Next.js app, replace Git-push deploy with GitHub Actions → ECR → ECS pipeline
- Vercel Cron → EventBridge + Lambda

---

## Feature / Phase Matrix

| Feature | Phase | How It Would Be Built | Dependencies |
|---|---|---|---|
| Guided freeze workflow | 1 | Step-by-step UI with instructions and external links to each bureau's freeze page | None |
| Pre-flight checklist | 1 | Form/checklist collecting what user needs before starting (SSN, ID, etc.) | None |
| Completion summary | 1 | UI state tracking which steps user has completed | None |
| Self-reported freeze status tracker | 1 | Per-bureau toggle/checkbox stored against user profile | User accounts, database |
| User accounts | 1 | Email/password or OAuth (Google, Apple sign-in) | Auth provider (Supabase Auth) |
| Browser-based credential save prompts | 1 | Standard autocomplete attributes on login forms; browser handles the rest | Web app, no custom code needed |
| Email notifications | 1 | Transactional email on signup, status changes, reminders | SES or SendGrid |
| Reminder to re-freeze after thaw | 1 | Scheduled job that checks thaw windows and sends reminder | User accounts, notification infrastructure |
| Face ID / biometric login | 2 | Native biometric APIs (LocalAuthentication on iOS, BiometricPrompt on Android) | Native mobile app |
| Keychain credential storage | 2 | iOS Keychain Services API to store bureau logins on device | Native iOS app |
| Google Password Manager integration | 2 | Android Credential Manager API | Native Android app |
| Push notifications | 2 | Firebase Cloud Messaging (Android), APNs (iOS) | Native mobile app |
| Bureau login proxy | 2 | App stores bureau credentials, automates login via headless browser | Bureau credentials stored (security/liability risk), browser automation (violates bureau ToS) |
| Automated freeze/unfreeze | 3 | Direct API calls to bureau systems | Bureau API partnerships (don't exist) |
| Automated freeze status detection | 3 | API polling or webhook from bureaus | Bureau API partnerships (don't exist) |
| Temporary unlock automation | 3 | Scheduled API call to unfreeze, then re-freeze after window | Bureau API partnerships (don't exist) |
| Freeze activity alerts | 3 | Push/email triggered by bureau status changes | Bureau API partnerships (don't exist) |
| One-click freeze all 3 bureaus | 3 | Single action triggers freeze at all three bureaus | Bureau API partnerships (don't exist) |
| B2B2C white-label deployment | 3 | Tenant config layer, custom branding per client, admin dashboard | Multi-tenant backend architecture |
| Admin dashboard for breach clients | 3 | Portal showing enrollment counts, freeze completion rates | Backend + admin UI |
| Breach bundle billing | 3 | Tiered pricing engine, invoicing or payment processing | Stripe |
| Enterprise API | 3 | REST API exposing enrollment, status, reporting endpoints | Defined data model, API gateway, auth tokens |

---

## Technical Constraints

### Bureau API Availability
No credit bureau (Equifax, TransUnion, Experian) exposes a consumer-facing freeze/unfreeze API for third-party integration. Equifax's "Allow Access" API is lender-side only. All freeze management by consumers must occur directly on each bureau's website, by phone, or by mail. This constraint means:
- Phase 1 MVP can only link to bureau sites, not control them
- Automated freeze/unfreeze requires either bureau partnerships (historically blocked) or browser automation (ToS violation, fragile)
- The "unified control layer" vision requires regulatory mandate or bureau cooperation to fully realize

### Data the App Does NOT Store
- Social Security Numbers
- Dates of birth
- Government ID information
- Bureau login credentials (Phase 1)
- Credit report data
- Credit scores

---

## Database Schema

| Table | Purpose |
|---|---|
| users | id, email, first_name, last_name, created_at, updated_at (Supabase Auth + profile) |
| bureau_status | id, user_id, bureau, status, status_updated_at, frozen_date, notes |
| thaw_reminders | id, user_id, bureau, thaw_start_date, thaw_end_date, reminder_sent, created_at, cancelled_at |
| freeze_workflow_progress | id, user_id, current_step, checklist_completed, equifax_completed, transunion_completed, experian_completed, completed_at |
| freeze_issues | id, user_id, bureau, issue_type, issue_details, created_at |
| activity_log | id, user_id, bureau, action, source, created_at |
| contact_submissions | id, name, email, subject, message, created_at |
| notification_preferences | id, user_id, refreeze_reminders, thaw_expiration_alerts, weekly_summary, security_alerts |

---

## Success Metrics

- Signup → freeze workflow start rate
- Freeze workflow completion rate (all 3 bureaus)
- Per-bureau drop-off rate (which bureau step loses users)
- Issue report frequency and category distribution
- Return visits to dashboard (ongoing engagement)
- Thaw reminder → re-freeze confirmation rate

---

## Open Questions

1. Pricing model for Phase 1 — free, freemium, or paid from launch?
2. Legal review of privacy policy and terms — who is responsible?
3. Compliance review — any FCRA exposure even as an informational tool?
4. Brand name and domain — is "freezer" the working name?
5. Bureau deep link stability — do the freeze page URLs change frequently?
6. Phase 2 credential manager — has legal counsel reviewed liability of storing bureau logins?
7. B2B2C breach bundle pricing — validated with any potential customers?
