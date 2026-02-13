"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/animate";
import { HeroGradient } from "@/components/gradient-bg";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score: 4, label: "Strong", color: "bg-green-500" };
  return { score: 5, label: "Very Strong", color: "bg-green-600" };
}

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const passwordStrength = useMemo(
    () => (password ? getPasswordStrength(password) : null),
    [password]
  );

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
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
    if (!agreedToTerms) {
      errors.terms = "You must agree to the Terms of Service and Privacy Policy.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (signUpError) {
        if (signUpError.status === 429) {
          setGeneralError("Too many attempts. Please wait a moment and try again.");
        } else {
          setGeneralError(signUpError.message);
        }
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("3bfreeze_verify_email", email);
      }
      router.push("/verify-email");
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setGeneralError(null);
    setIsOAuthLoading(provider);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setGeneralError(oauthError.message);
        setIsOAuthLoading(null);
      }
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
      setIsOAuthLoading(null);
    }
  }

  const isDisabled = isLoading || isOAuthLoading !== null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8">
      <HeroGradient />
      <FadeIn className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold">
          <Shield className="h-4 w-4 text-primary" />
          3Bfreeze
        </Link>
        <Card className="rounded-2xl border-primary/10 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Create your account</CardTitle>
          <CardDescription>Get started with 3Bfreeze for free</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {generalError && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (fieldErrors.firstName)
                      setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                  }}
                  disabled={isDisabled}
                  autoComplete="given-name"
                  autoFocus
                  aria-invalid={!!fieldErrors.firstName}
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (fieldErrors.lastName)
                      setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                  }}
                  disabled={isDisabled}
                  autoComplete="family-name"
                  aria-invalid={!!fieldErrors.lastName}
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email)
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                disabled={isDisabled}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                disabled={isDisabled}
                autoComplete="new-password"
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
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                }}
                disabled={isDisabled}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.confirmPassword}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => {
                    setAgreedToTerms(checked === true);
                    if (fieldErrors.terms)
                      setFieldErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  disabled={isDisabled}
                  aria-invalid={!!fieldErrors.terms}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-snug text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {fieldErrors.terms && (
                <p className="text-xs text-destructive">{fieldErrors.terms}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isDisabled}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="relative my-6 flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth("google")}
              disabled={isDisabled}
            >
              {isOAuthLoading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuth("apple")}
              disabled={isDisabled}
            >
              {isOAuthLoading === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}
