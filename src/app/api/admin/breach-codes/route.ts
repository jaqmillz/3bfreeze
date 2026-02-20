import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

async function verifyAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(user.email.toLowerCase());
}

// Create breach code
export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const supabase = createServiceClient();

    const { error } = await supabase.from("breach_codes").insert({
      code: body.code,
      name: body.name,
      description: body.description,
      date: body.date,
      records_affected: body.records_affected,
      data_exposed: body.data_exposed,
    });

    if (error) {
      console.error("Create breach code failed:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Update breach code
export async function PUT(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("breach_codes")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Update breach code failed:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Toggle active status
export async function PATCH(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, active } = await request.json();
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("breach_codes")
      .update({ active })
      .eq("id", id);

    if (error) {
      console.error("Toggle breach code failed:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
