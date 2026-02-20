-- Add length constraints to unbounded text columns
-- Defense-in-depth: API validates inputs, but DB should enforce limits too

-- breach_visits table
ALTER TABLE public.breach_visits
  ADD CONSTRAINT breach_visits_code_length CHECK (char_length(breach_code) <= 50);

ALTER TABLE public.breach_visits
  ADD CONSTRAINT breach_visits_source_length CHECK (char_length(source) <= 20);

-- contact_submissions table
ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_name_length CHECK (char_length(name) <= 255);

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_email_length CHECK (char_length(email) <= 255);

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_subject_length CHECK (char_length(subject) <= 500);

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_message_length CHECK (char_length(message) <= 50000);

-- users attribution columns
ALTER TABLE public.users
  ADD CONSTRAINT users_breach_code_length CHECK (signup_breach_code IS NULL OR char_length(signup_breach_code) <= 50);

ALTER TABLE public.users
  ADD CONSTRAINT users_signup_source_length CHECK (signup_source IS NULL OR char_length(signup_source) <= 30);
