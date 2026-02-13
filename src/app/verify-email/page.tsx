"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/animate";
import { HeroGradient } from "@/components/gradient-bg";

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <HeroGradient />
        <Loader2 className="relative z-10 h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const paramEmail = searchParams.get("email");
    if (paramEmail) {
      setEmail(paramEmail);
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("3bfreeze_verify_email");
      if (stored) setEmail(stored);
    }
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      await supabase.auth.resend({
        type: "signup",
        email,
      });
      setResendSuccess(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      // Silently handle - we don't reveal whether the email exists
    } finally {
      setIsResending(false);
    }
  }, [email, cooldown, isResending]);

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, start, middle, domain) => {
        return start + "*".repeat(Math.min(middle.length, 6)) + domain;
      })
    : null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <HeroGradient />
      <FadeIn className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold">
          <Shield className="h-4 w-4 text-primary" />
          3Bfreeze
        </Link>
        <Card className="rounded-2xl border-primary/10 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Check your email</CardTitle>
          <CardDescription>
            {maskedEmail ? (
              <>
                We sent a verification link to{" "}
                <span className="font-medium text-foreground">{maskedEmail}</span>.
                Click the link to activate your account.
              </>
            ) : (
              <>
                We sent a verification link to your email address. Click the link to
                activate your account.
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {resendSuccess && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Verification email resent successfully.</span>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending || !email}
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend Email (${cooldown}s)`
            ) : (
              "Resend Email"
            )}
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Back to Login
          </Link>
        </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}
