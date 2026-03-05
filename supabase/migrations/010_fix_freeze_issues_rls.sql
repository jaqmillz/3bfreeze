-- Fix: The "Service role can read all issues" policy used USING (true) which
-- allows ANY role (including anon) to read all freeze_issues rows.
-- Drop it and replace with a policy scoped to authenticated users reading their own rows.
-- Admin reads use the service role client which bypasses RLS entirely.

DROP POLICY IF EXISTS "Service role can read all issues" ON public.freeze_issues;

-- Authenticated users can only read their own issues
CREATE POLICY "Users can read own issues"
  ON public.freeze_issues FOR SELECT
  USING (auth.uid() = user_id);

-- Revoke public execute on delete_user_account (defense in depth)
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
