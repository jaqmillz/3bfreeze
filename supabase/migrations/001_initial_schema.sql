-- Three-Bureau Credit Freeze - Initial Schema
-- Run against Supabase PostgreSQL

-- Uses gen_random_uuid() which is built into PostgreSQL 13+

-- ============================================================
-- Users profile table (extends Supabase Auth)
-- ============================================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.users for delete
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

-- ============================================================
-- Bureau Status
-- ============================================================
create type public.bureau_enum as enum ('equifax', 'transunion', 'experian');
create type public.freeze_status_enum as enum ('frozen', 'not_frozen');

create table public.bureau_status (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bureau public.bureau_enum not null,
  status public.freeze_status_enum default 'not_frozen' not null,
  status_updated_at timestamptz default now() not null,
  frozen_date timestamptz,
  notes text,
  unique(user_id, bureau)
);

alter table public.bureau_status enable row level security;

create policy "Users can view own bureau status"
  on public.bureau_status for select
  using (auth.uid() = user_id);

create policy "Users can insert own bureau status"
  on public.bureau_status for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bureau status"
  on public.bureau_status for update
  using (auth.uid() = user_id);

create policy "Users can delete own bureau status"
  on public.bureau_status for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Thaw Reminders
-- ============================================================
create table public.thaw_reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bureau public.bureau_enum not null,
  thaw_start_date date not null,
  thaw_end_date date not null,
  reminder_sent boolean default false not null,
  created_at timestamptz default now() not null,
  cancelled_at timestamptz
);

alter table public.thaw_reminders enable row level security;

create policy "Users can view own thaw reminders"
  on public.thaw_reminders for select
  using (auth.uid() = user_id);

create policy "Users can insert own thaw reminders"
  on public.thaw_reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own thaw reminders"
  on public.thaw_reminders for update
  using (auth.uid() = user_id);

create policy "Users can delete own thaw reminders"
  on public.thaw_reminders for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Freeze Workflow Progress
-- ============================================================
create type public.workflow_step_enum as enum ('checklist', 'equifax', 'transunion', 'experian', 'complete');

create table public.freeze_workflow_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  current_step public.workflow_step_enum default 'checklist' not null,
  checklist_completed boolean default false not null,
  equifax_completed boolean default false not null,
  transunion_completed boolean default false not null,
  experian_completed boolean default false not null,
  completed_at timestamptz
);

alter table public.freeze_workflow_progress enable row level security;

create policy "Users can view own workflow progress"
  on public.freeze_workflow_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own workflow progress"
  on public.freeze_workflow_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workflow progress"
  on public.freeze_workflow_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own workflow progress"
  on public.freeze_workflow_progress for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Freeze Issues
-- ============================================================
create type public.issue_type_enum as enum ('identity_verification', 'site_error', 'asked_to_pay', 'confused', 'other');

create table public.freeze_issues (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bureau public.bureau_enum not null,
  issue_type public.issue_type_enum not null,
  issue_details text,
  created_at timestamptz default now() not null
);

alter table public.freeze_issues enable row level security;

create policy "Users can view own freeze issues"
  on public.freeze_issues for select
  using (auth.uid() = user_id);

create policy "Users can insert own freeze issues"
  on public.freeze_issues for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Activity Log
-- ============================================================
create type public.activity_action_enum as enum ('frozen', 'unfrozen', 'thaw_scheduled', 'thaw_cancelled', 'issue_reported');
create type public.activity_source_enum as enum ('freeze_workflow', 'manual_update', 'scheduled_thaw');

create table public.activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  bureau public.bureau_enum not null,
  action public.activity_action_enum not null,
  source public.activity_source_enum not null,
  created_at timestamptz default now() not null
);

alter table public.activity_log enable row level security;

create policy "Users can view own activity log"
  on public.activity_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity log"
  on public.activity_log for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- Contact Submissions (public, no auth required)
-- ============================================================
create table public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default now() not null
);

alter table public.contact_submissions enable row level security;

create policy "Anyone can insert contact submissions"
  on public.contact_submissions for insert
  with check (true);

-- ============================================================
-- Notification Preferences
-- ============================================================
create table public.notification_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  refreeze_reminders boolean default true not null,
  thaw_expiration_alerts boolean default true not null,
  weekly_summary boolean default false not null,
  security_alerts boolean default true not null
);

alter table public.notification_preferences enable row level security;

create policy "Users can view own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_bureau_status_user_id on public.bureau_status(user_id);
create index idx_thaw_reminders_user_id on public.thaw_reminders(user_id);
create index idx_thaw_reminders_end_date on public.thaw_reminders(thaw_end_date) where cancelled_at is null;
create index idx_activity_log_user_id on public.activity_log(user_id);
create index idx_activity_log_created_at on public.activity_log(created_at);
create index idx_freeze_issues_user_id on public.freeze_issues(user_id);
