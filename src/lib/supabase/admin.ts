import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with service role key — bypasses RLS.
 * Only use in server components and API routes within admin pages.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
