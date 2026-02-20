"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBreachByCode } from "@/lib/breach-codes";

export function BreachCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      setError("Code not recognized. Check your letter and try again.");
      return;
    }

    // Log breach visit from homepage (fire-and-forget)
    fetch("/api/breach-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ breach_code: breach.code, source: "homepage" }),
    }).catch(() => {});

    router.push(`/breach/${breach.code}`);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex items-center justify-center gap-2 mb-3">
        <ShieldAlert className="h-4 w-4 text-destructive/60" />
        <h3 className="text-sm font-semibold">Have a breach code?</h3>
      </div>
      <p className="text-center text-xs text-muted-foreground mb-4">
        Enter the code from your breach notification letter.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="text"
          placeholder="e.g., ACME2024"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          className={`text-center tracking-wider ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          aria-invalid={!!error}
        />
        {code.trim() && (
          <Button type="submit" className="w-full gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </form>
      {error && (
        <p className="mt-2 text-center text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
