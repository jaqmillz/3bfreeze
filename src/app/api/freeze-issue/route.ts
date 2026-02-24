import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_BUREAUS = ["equifax", "transunion", "experian"];
const VALID_ISSUE_TYPES = [
  "account_access",
  "identity_verification",
  "site_error",
  "asked_to_pay",
  "confused",
  "other",
];

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
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (isRateLimited(ip)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = await request.json();
    const { bureau, issue_type, issue_details, session_id, source } = body;

    if (!bureau || !VALID_BUREAUS.includes(bureau)) {
      return NextResponse.json({ error: "invalid bureau" }, { status: 400 });
    }

    if (!issue_type || !VALID_ISSUE_TYPES.includes(issue_type)) {
      return NextResponse.json(
        { error: "invalid issue_type" },
        { status: 400 }
      );
    }

    if (!session_id || typeof session_id !== "string" || session_id.length > 100) {
      return NextResponse.json(
        { error: "session_id required" },
        { status: 400 }
      );
    }

    const safeDetails =
      issue_details && typeof issue_details === "string"
        ? issue_details.slice(0, 1000)
        : null;

    const safeSource =
      source && typeof source === "string" && source.length <= 50
        ? source
        : null;

    const supabase = await createClient();
    const { error } = await supabase.from("freeze_issues").insert({
      bureau,
      issue_type,
      issue_details: safeDetails,
      session_id,
      source: safeSource,
    });

    if (error) {
      console.error("Freeze issue insert failed:", error);
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Freeze issue endpoint error:", err);
    return new NextResponse(null, { status: 204 });
  }
}
