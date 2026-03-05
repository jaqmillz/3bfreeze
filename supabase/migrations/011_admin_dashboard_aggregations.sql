-- Admin dashboard SQL aggregation functions
-- Moves heavy processing from Node.js to PostgreSQL for O(1) admin page loads at scale

-- 1. Bureau freeze counts (replaces fetching all bureau_status rows)
CREATE OR REPLACE FUNCTION admin_bureau_freeze_counts()
RETURNS TABLE(bureau text, frozen_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT bureau, COUNT(*)
  FROM bureau_status
  WHERE status = 'frozen'
  GROUP BY bureau;
$$;

-- 2. Signup source breakdown (replaces fetching all users rows)
CREATE OR REPLACE FUNCTION admin_signup_source_breakdown()
RETURNS TABLE(source text, user_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(signup_source, 'unknown') as source, COUNT(*) as user_count
  FROM users
  GROUP BY COALESCE(signup_source, 'unknown');
$$;

-- 3. Daily signup trend (replaces fetching all users + JS date grouping)
CREATE OR REPLACE FUNCTION admin_signup_trend()
RETURNS TABLE(day date, signups bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT created_at::date as day, COUNT(*) as signups
  FROM users
  GROUP BY created_at::date
  ORDER BY day;
$$;

-- 4. Daily visit trend (replaces fetching all breach_visits + JS date grouping)
CREATE OR REPLACE FUNCTION admin_visit_trend()
RETURNS TABLE(day date, visits bigint)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT created_at::date as day, COUNT(*) as visits
  FROM breach_visits
  GROUP BY created_at::date
  ORDER BY day;
$$;

-- 5. Breach funnel: per breach code stats (replaces 3 queries + complex JS)
CREATE OR REPLACE FUNCTION admin_breach_funnel()
RETURNS TABLE(
  code text,
  name text,
  active boolean,
  visits bigint,
  signups bigint,
  froze1 bigint,
  froze2 bigint,
  froze_all bigint
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH visit_counts AS (
    SELECT breach_code, COUNT(*) as cnt
    FROM breach_visits
    GROUP BY breach_code
  ),
  signup_counts AS (
    SELECT signup_breach_code as breach_code, COUNT(*) as cnt
    FROM users
    WHERE signup_breach_code IS NOT NULL
    GROUP BY signup_breach_code
  ),
  freeze_sessions AS (
    SELECT session_id, breach_code, COUNT(DISTINCT bureau) as bureau_count
    FROM breach_freeze_events
    WHERE breach_code IS NOT NULL
    GROUP BY session_id, breach_code
  ),
  freeze_counts AS (
    SELECT
      breach_code,
      COUNT(*) FILTER (WHERE bureau_count >= 1) as froze1,
      COUNT(*) FILTER (WHERE bureau_count >= 2) as froze2,
      COUNT(*) FILTER (WHERE bureau_count >= 3) as froze_all
    FROM freeze_sessions
    GROUP BY breach_code
  )
  SELECT
    bc.code,
    bc.name,
    bc.active,
    COALESCE(vc.cnt, 0) as visits,
    COALESCE(sc.cnt, 0) as signups,
    COALESCE(fc.froze1, 0) as froze1,
    COALESCE(fc.froze2, 0) as froze2,
    COALESCE(fc.froze_all, 0) as froze_all
  FROM breach_codes bc
  LEFT JOIN visit_counts vc ON vc.breach_code = bc.code
  LEFT JOIN signup_counts sc ON sc.breach_code = bc.code
  LEFT JOIN freeze_counts fc ON fc.breach_code = bc.code
  ORDER BY bc.created_at;
$$;

-- 6. Overall + direct freeze session stats (replaces complex JS session processing)
CREATE OR REPLACE FUNCTION admin_overall_freeze_stats()
RETURNS TABLE(
  category text,
  froze1 bigint,
  froze2 bigint,
  froze_all bigint,
  session_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  WITH session_bureaus AS (
    SELECT session_id, breach_code, COUNT(DISTINCT bureau) as bureau_count
    FROM breach_freeze_events
    GROUP BY session_id, breach_code
  ),
  -- All sessions: merge across breach codes per session_id
  all_merged AS (
    SELECT session_id, MAX(bureau_count) as bureau_count
    FROM session_bureaus
    GROUP BY session_id
  ),
  -- Direct sessions: only events without a breach code
  direct_only AS (
    SELECT session_id, bureau_count
    FROM session_bureaus
    WHERE breach_code IS NULL
  )
  SELECT 'all'::text as category,
    COUNT(*) FILTER (WHERE bureau_count >= 1),
    COUNT(*) FILTER (WHERE bureau_count >= 2),
    COUNT(*) FILTER (WHERE bureau_count >= 3),
    COUNT(*)
  FROM all_merged
  UNION ALL
  SELECT 'direct'::text as category,
    COUNT(*) FILTER (WHERE bureau_count >= 1),
    COUNT(*) FILTER (WHERE bureau_count >= 2),
    COUNT(*) FILTER (WHERE bureau_count >= 3),
    COUNT(*)
  FROM direct_only;
$$;

-- Restrict admin functions to authenticated users only
-- (Service role used by admin page bypasses these, but prevents browser-client abuse)
REVOKE EXECUTE ON FUNCTION admin_bureau_freeze_counts FROM anon, public;
GRANT EXECUTE ON FUNCTION admin_bureau_freeze_counts TO authenticated;

REVOKE EXECUTE ON FUNCTION admin_signup_source_breakdown FROM anon, public;
GRANT EXECUTE ON FUNCTION admin_signup_source_breakdown TO authenticated;

REVOKE EXECUTE ON FUNCTION admin_signup_trend FROM anon, public;
GRANT EXECUTE ON FUNCTION admin_signup_trend TO authenticated;

REVOKE EXECUTE ON FUNCTION admin_visit_trend FROM anon, public;
GRANT EXECUTE ON FUNCTION admin_visit_trend TO authenticated;

REVOKE EXECUTE ON FUNCTION admin_breach_funnel FROM anon, public;
GRANT EXECUTE ON FUNCTION admin_breach_funnel TO authenticated;

REVOKE EXECUTE ON FUNCTION admin_overall_freeze_stats FROM anon, public;
GRANT EXECUTE ON FUNCTION admin_overall_freeze_stats TO authenticated;
