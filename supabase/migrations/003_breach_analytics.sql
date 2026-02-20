-- Breach Analytics & User Attribution
-- Anonymous visit tracking (no PII) + signup source attribution

-- ============================================================
-- Anonymous breach visit counter
-- ============================================================
create table public.breach_visits (
  id uuid default gen_random_uuid() primary key,
  breach_code text not null,
  source text not null default 'direct',  -- 'direct' | 'homepage'
  created_at timestamptz default now() not null
);

alter table public.breach_visits enable row level security;

-- Anyone can insert (anonymous visitors, no auth required)
create policy "Anyone can insert breach visits"
  on public.breach_visits for insert
  with check (true);

-- No select policy = no public reads via anon key
-- Only service role can read (for admin queries)

create index idx_breach_visits_code on public.breach_visits(breach_code);
create index idx_breach_visits_created_at on public.breach_visits(created_at);

-- ============================================================
-- User attribution columns
-- ============================================================
alter table public.users add column signup_breach_code text;
alter table public.users add column signup_source text;
