import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

const VALID_BUREAUS = ["equifax", "transunion", "experian"];
const VALID_ISSUE_TYPES = [
  "account_access",
  "identity_verification",
  "site_error",
  "asked_to_pay",
  "confused",
  "other",
];

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (await isRateLimited(ip, "freeze-issue")) {
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
