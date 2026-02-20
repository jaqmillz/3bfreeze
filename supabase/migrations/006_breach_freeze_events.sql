-- Track anonymous freeze completions (before user signs up)
-- Used for admin funnel: Visits → Froze 1+ → All 3 Frozen → Signed Up
create table public.breach_freeze_events (
  id uuid default gen_random_uuid() primary key,
  breach_code text,  -- null for direct /freeze visitors
  bureau text not null check (bureau in ('equifax', 'transunion', 'experian')),
  session_id text not null,  -- anonymous localStorage ID for deduplication
  created_at timestamptz default now() not null
);

alter table public.breach_freeze_events enable row level security;

-- Allow anonymous inserts (no auth required)
create policy "Anyone can insert freeze events"
  on public.breach_freeze_events for insert with check (true);

-- Only service role can read (admin dashboard)
-- No select policy = RLS blocks reads for anon/authenticated, service role bypasses

create index idx_breach_freeze_events_breach_code on public.breach_freeze_events(breach_code);
create index idx_breach_freeze_events_session on public.breach_freeze_events(session_id);

-- Prevent duplicate events (same session + bureau + breach_code)
create unique index idx_breach_freeze_events_unique
  on public.breach_freeze_events(session_id, bureau, coalesce(breach_code, '__direct__'));
