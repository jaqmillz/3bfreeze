import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBreachByCode } from "@/lib/breach-codes";

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
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = await request.json();
    const { breach_code, source } = body;

    if (!breach_code || typeof breach_code !== "string") {
      return NextResponse.json({ error: "breach_code required" }, { status: 400 });
    }

    if (breach_code.length > 50) {
      return NextResponse.json({ error: "breach_code too long" }, { status: 400 });
    }

    if (!getBreachByCode(breach_code)) {
      return NextResponse.json({ error: "unknown breach code" }, { status: 400 });
    }

    const validSources = ["direct", "homepage"];
    const safeSource = validSources.includes(source) ? source : "direct";

    const supabase = await createClient();
    const { error } = await supabase.from("breach_visits").insert({
      breach_code,
      source: safeSource,
    });

    if (error) {
      console.error("Breach visit insert failed:", error);
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Breach visit endpoint error:", err);
    return new NextResponse(null, { status: 204 });
  }
}
