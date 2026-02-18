"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LockOpen, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeUp } from "@/components/animate";
import { HeroGradient } from "@/components/gradient-bg";
import { getBreachByCode } from "@/lib/breach-codes";

export default function BreachCodeEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input after animations settle
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter a breach code.");
      return;
    }

    const breach = getBreachByCode(trimmed);
    if (!breach) {
      // Invalid code — redirect to signup
      router.push("/signup");
      return;
    }

    router.push(`/breach/${breach.code}`);
  }

  return (
    <section className="relative flex flex-col items-center justify-center px-6 py-20 sm:py-28">
      <HeroGradient />

      <FadeUp className="relative z-10 w-full max-w-md">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
            <ShieldAlert className="h-3 w-3" />
            Data Breach Response
          </span>
        </div>
      </FadeUp>

      <FadeUp delay={0.1} className="relative z-10">
        <h1 className="mt-6 max-w-lg text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Your data may have been exposed
        </h1>
      </FadeUp>

      <FadeUp delay={0.2} className="relative z-10">
        <div className="mx-auto mt-5 max-w-sm rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <LockOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your credit file is like a door that was left unlocked. Freezing
              it is like adding a deadbolt &mdash; free and instant.
            </p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3} className="relative z-10 w-full max-w-sm">
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Enter the breach code from your notification letter.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <Input
            ref={inputRef}
            type="text"
            placeholder="e.g., ACME2024"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            className="text-center text-lg tracking-wider"
          />
          {error && (
            <p className="text-center text-xs text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have a code?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            You can still protect yourself
          </Link>
        </p>
      </FadeUp>
    </section>
  );
}
