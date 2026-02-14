"use client";

import { useState, useMemo } from "react";
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
import { getPasswordStrength } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const passwordStrength = useMemo(
    () => (password ? getPasswordStrength(password) : null),
    [password]
  );

  function validate(): boolean {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        if (updateError.status === 429) {
          setError("Too many attempts. Please wait a moment and try again.");
        } else {
          setError(updateError.message);
        }
        return;
      }

      setIsSuccess(true);
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
          <CardTitle className="text-xl font-bold">Set a new password</CardTitle>
          <CardDescription>
            {isSuccess
              ? "Your password has been updated."
              : "Choose a strong password for your account."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-start gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Password updated successfully. You can now log in with your new password.</span>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
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
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  autoFocus
                  aria-invalid={!!fieldErrors.password}
                />
                {passwordStrength && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex h-1.5 gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
                {fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.confirmPassword}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  "Reset Password"
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
