import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_BUREAUS = ["equifax", "transunion", "experian"];

// Simple in-memory rate limiter: max 20 requests per IP per minute
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = await request.json();
    const { breach_code, bureau, session_id } = body;

    if (!bureau || !VALID_BUREAUS.includes(bureau)) {
      return NextResponse.json({ error: "invalid bureau" }, { status: 400 });
    }

    if (!session_id || typeof session_id !== "string" || session_id.length > 100) {
      return NextResponse.json({ error: "session_id required" }, { status: 400 });
    }

    // breach_code is optional (null for direct /freeze visitors)
    const safeBreachCode = breach_code && typeof breach_code === "string" && breach_code.length <= 50
      ? breach_code
      : null;

    const supabase = await createClient();
    const { error } = await supabase.from("breach_freeze_events").insert({
      breach_code: safeBreachCode,
      bureau,
      session_id,
    });

    // Ignore unique constraint violations (duplicate events)
    if (error && !error.message.includes("duplicate")) {
      console.error("Breach freeze event insert failed:", error);
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Breach freeze endpoint error:", err);
    return new NextResponse(null, { status: 204 });
  }
}
