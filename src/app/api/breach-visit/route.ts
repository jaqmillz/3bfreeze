import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBreachByCode } from "@/lib/breach-codes";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (await isRateLimited(ip, "breach-visit")) {
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

    if (!(await getBreachByCode(breach_code))) {
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
