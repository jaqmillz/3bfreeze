import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Distributed rate limiter using Upstash Redis.
 * Falls back to a no-op (always allows) if UPSTASH env vars are missing,
 * so dev works without Redis and the app degrades gracefully.
 */

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    // 20 requests per 60 second sliding window
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: true,
    prefix: "3bfreeze:ratelimit",
  });

  return ratelimit;
}

/**
 * Check if a request should be rate limited.
 * Returns true if the request should be BLOCKED.
 */
export async function isRateLimited(
  identifier: string,
  prefix?: string
): Promise<boolean> {
  const rl = getRatelimit();
  if (!rl) return false; // no Redis configured, allow all

  const key = prefix ? `${prefix}:${identifier}` : identifier;
  const { success } = await rl.limit(key);
  return !success;
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}
