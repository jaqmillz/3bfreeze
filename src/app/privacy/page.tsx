import Link from "next/link";
import { Footer } from "@/components/footer";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/animate";
import { GridPattern } from "@/components/gradient-bg";

export const metadata = {
  title: "Privacy Policy - 3Bfreeze",
  description:
    "Learn how 3Bfreeze handles your data. We collect minimal information and never store sensitive credentials.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <Shield className="h-6 w-6 text-primary" />
            3Bfreeze
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <article className="relative py-16 md:py-24">
          <GridPattern />
          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <FadeUp>
                <h1 className="text-4xl font-bold tracking-tight">
                  Privacy Policy
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Last updated: February 2026
                </p>
              </FadeUp>

              <Separator className="my-8" />

              <StaggerChildren className="space-y-8">
                <StaggerItem>
                  <section>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Information We Collect
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      3Bfreeze collects only the minimum information necessary to
                      provide our service. When you create an account, we collect
                      your name and email address. We use this information solely
                      to identify your account and communicate with you about
                      your freeze status.
                    </p>
                  </section>
                </StaggerItem>

                <StaggerItem>
                  <section>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      How We Use Your Information
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      We use the information we collect to operate and maintain
                      your account, send you freeze status notifications and
                      thaw expiration reminders, respond to your support
                      requests, and improve our service. We do not sell, rent, or
                      share your personal information with third parties for
                      marketing purposes.
                    </p>
                  </section>
                </StaggerItem>

                <StaggerItem>
                  <section>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      What We Don&#39;t Store
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      3Bfreeze is designed with a minimal-data philosophy. We
                      explicitly do <strong>not</strong> collect or store:
                    </p>
                    <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                      <li>Social Security Numbers (SSN)</li>
                      <li>Dates of birth</li>
                      <li>Government-issued identification documents</li>
                      <li>Credit bureau account credentials or PINs</li>
                      <li>Credit reports, scores, or any credit data</li>
                    </ul>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      Your interactions with credit bureau websites happen
                      directly between you and the bureaus. 3Bfreeze guides you
                      through the process but never acts as an intermediary for
                      sensitive information.
                    </p>
                  </section>
                </StaggerItem>

                <StaggerItem>
                  <section>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Data Security
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      We implement industry-standard security measures to protect
                      the limited data we hold. All data is encrypted in transit
                      using TLS and encrypted at rest. Access to production
                      systems is restricted and audited. We conduct regular
                      security reviews and follow best practices for application
                      security.
                    </p>
                  </section>
                </StaggerItem>

                <StaggerItem>
                  <section>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Your Rights
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      You have the right to access, export, and delete your
                      personal data at any time. You can export all data
                      associated with your account from your account settings.
                      You can delete your account entirely, which permanently
                      removes all of your data from our systems. If you need
                      assistance exercising these rights, contact us at the
                      address below.
                    </p>
                  </section>
                </StaggerItem>

                <StaggerItem>
                  <section>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Contact Us
                    </h2>
                    <p className="mt-4 leading-7 text-muted-foreground">
                      If you have questions about this Privacy Policy or your
                      personal data, please reach out through our{" "}
                      <Link
                        href="/contact"
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        contact page
                      </Link>
                      .
                    </p>
                  </section>
                </StaggerItem>
              </StaggerChildren>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
