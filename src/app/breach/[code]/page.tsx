import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { getBreachByCode } from "@/lib/breach-codes";
import { createClient } from "@/lib/supabase/server";
import { BreachWorkflowClient } from "@/components/breach-workflow-client";

interface Props {
  params: Promise<{ code: string }>;
}

// Deduplicate getBreachByCode calls within a single request
const getCachedBreach = cache((code: string) => getBreachByCode(code));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const breach = await getCachedBreach(code);
  if (!breach) {
    return { title: "Invalid Code — 3Bfreeze" };
  }
  return {
    title: `${breach.name} — Freeze Your Credit | 3Bfreeze`,
    description: `Your data was exposed in the ${breach.name}. Freeze your credit for free in about 15 minutes.`,
  };
}

export default async function BreachCodePage({ params }: Props) {
  const { code } = await params;
  const breach = await getCachedBreach(code);

  if (!breach) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    redirect(user ? "/dashboard" : "/");
  }

  // Log anonymous breach visit via the rate-limited API route
  // instead of direct Supabase insert (which bypasses rate limiting)
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "";
  fetch(`${origin}/api/breach-visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ breach_code: breach.code, source: "direct" }),
  }).catch(() => {});

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <BreachWorkflowClient breach={breach} />
    </div>
  );
}
