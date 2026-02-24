-- Allow anonymous issue reporting from public /freeze and /breach flows
ALTER TABLE public.freeze_issues ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.freeze_issues ADD COLUMN session_id text;
ALTER TABLE public.freeze_issues ADD COLUMN source text;

-- Allow anonymous inserts (via API route, no auth)
CREATE POLICY "Allow anonymous issue inserts"
  ON public.freeze_issues FOR INSERT
  WITH CHECK (true);

-- Allow service role to read all issues (admin page)
CREATE POLICY "Service role can read all issues"
  ON public.freeze_issues FOR SELECT
  USING (true);
