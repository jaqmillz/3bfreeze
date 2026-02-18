import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBreachByCode } from "@/lib/breach-codes";
import { BreachHero } from "@/components/breach-hero";
import { BreachWorkflowClient } from "@/components/breach-workflow-client";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const breach = getBreachByCode(code);
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
  const breach = getBreachByCode(code);

  if (!breach) {
    redirect("/signup");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <BreachHero breach={breach} />
      <BreachWorkflowClient breach={breach} />
    </div>
  );
}
