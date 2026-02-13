# 3Bfreeze

A guided web application that helps users freeze their credit at all three major bureaus (Equifax, TransUnion, and Experian) to protect against identity theft and unauthorized credit inquiries.

## Features

- **Guided Freeze Workflow** — Step-by-step instructions to freeze credit at each bureau, with direct links and helpful tips to avoid upsells
- **Guided Unfreeze Workflow** — Instructions for temporarily lifting or permanently removing a freeze when needed
- **Dashboard** — At-a-glance view of freeze status across all three bureaus with a visual shield indicator
- **Schedule Thaw** — Set temporary thaw windows with reminders so you don't forget to refreeze
- **Activity History** — Full log of freeze/unfreeze actions and thaw schedules
- **Auth** — Email/password authentication with email verification, password reset, and protected routes

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4
- **UI Components:** [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Backend/Auth:** [Supabase](https://supabase.com) (PostgreSQL, Auth, Row Level Security)
- **Notifications:** [Sonner](https://sonner.emilkowal.dev/) toast notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- A [Supabase](https://supabase.com) project

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Database

The Supabase migrations are in `supabase/migrations/`. To apply them locally:

```bash
npx supabase db push
```

## Project Structure

```
src/
  app/
    (app)/             # Authenticated routes (dashboard, freeze/unfreeze workflows, settings)
    login/             # Login page
    signup/            # Signup page
    forgot-password/   # Password reset request
    reset-password/    # Password reset form
    verify-email/      # Email verification
    page.tsx           # Marketing landing page
  components/
    ui/                # shadcn/ui primitives
    app-nav.tsx        # Authenticated app header + sidebar
    marketing-nav.tsx  # Marketing site header
    dashboard-client.tsx
    freeze-workflow-client.tsx
    unfreeze-workflow-client.tsx
  lib/
    supabase/          # Supabase client helpers (client + server)
    types.ts           # Shared TypeScript types and bureau config
    utils.ts           # Utility functions
```

## License

Private — All rights reserved.
