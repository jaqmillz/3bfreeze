-- Move breach codes from hardcoded TypeScript to database
-- Enables admin CRUD, active/inactive toggling, and analytics joins

create table public.breach_codes (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name text not null,
  description text not null,
  date text not null,
  records_affected text,
  data_exposed text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.breach_codes enable row level security;

-- Public can read active codes (needed for breach landing pages via anon key)
create policy "Anyone can read active breach codes"
  on public.breach_codes for select
  using (active = true);

-- Auto-update updated_at (reuses existing trigger function from 001)
create trigger set_breach_codes_updated_at
  before update on public.breach_codes
  for each row execute function public.update_updated_at();

create index idx_breach_codes_code on public.breach_codes(code);

-- Seed existing hardcoded breach codes
insert into public.breach_codes (code, name, description, date, records_affected, data_exposed) values
(
  'ACME2024',
  'Acme Corp Data Breach',
  'In September 2024, Acme Corp disclosed that an unauthorized party accessed customer databases containing personal information. The breach affected customers who created accounts between 2019 and 2024.',
  'September 2024',
  '2.4 million',
  '{Social Security Numbers,Names,Addresses,Phone Numbers}'
),
(
  'HEALTH2024',
  'National Health Network Breach',
  'In November 2024, National Health Network reported a cybersecurity incident involving unauthorized access to patient and member records. The breach was discovered during a routine security audit.',
  'November 2024',
  '5.1 million',
  '{Social Security Numbers,Names,Dates of Birth,Addresses,Insurance Information}'
),
(
  'BANK2024',
  'First Federal Bank Incident',
  'In January 2025, First Federal Bank notified customers of a data breach that exposed financial and personal records. The breach occurred through a compromised third-party vendor.',
  'January 2025',
  '890,000',
  '{Social Security Numbers,Names,Account Numbers,Addresses,Phone Numbers}'
);

-- Add length constraints
alter table public.breach_codes
  add constraint breach_codes_code_length check (char_length(code) <= 50);

alter table public.breach_codes
  add constraint breach_codes_name_length check (char_length(name) <= 255);

alter table public.breach_codes
  add constraint breach_codes_description_length check (char_length(description) <= 10000);
