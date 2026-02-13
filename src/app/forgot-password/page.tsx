"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/animate";
import { HeroGradient } from "@/components/gradient-bg";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        if (resetError.status === 429) {
          setError("Too many requests. Please wait a moment and try again.");
        } else {
          // Still show success to avoid revealing account existence
          setIsSubmitted(true);
        }
        return;
      }

      setIsSubmitted(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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
          <CardTitle className="text-xl font-bold">Reset your password</CardTitle>
          <CardDescription>
            {isSubmitted
              ? "Check your email for a reset link."
              : "Enter your email and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-start gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  If an account exists with that email, you&apos;ll receive a reset
                  link.
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Send another link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
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
