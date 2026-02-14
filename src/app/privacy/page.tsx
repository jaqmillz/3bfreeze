import Link from "next/link";
import { InfoPageShell } from "@/components/info-page-shell";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Privacy Policy - 3Bfreeze",
  description:
    "Learn how 3Bfreeze handles your data. We collect minimal information and never store sensitive credentials.",
};

export default function PrivacyPage() {
  return (
    <InfoPageShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: February 2026
        </p>

        <Separator className="my-8" />

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Information We Collect
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              3Bfreeze collects only the minimum information necessary to provide
              our service. When you create an account, we collect your name and
              email address. We use this information solely to identify your
              account and communicate with you about your freeze status.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              How We Use Your Information
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              We use the information we collect to operate and maintain your
              account, send you freeze status notifications and unfreeze expiration
              reminders, respond to your support requests, and improve our
              service. We do not sell, rent, or share your personal information
              with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              What We Don&#39;t Store
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              3Bfreeze is designed with a minimal-data philosophy. We explicitly
              do <strong>not</strong> collect or store:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Social Security Numbers (SSN)</li>
              <li>Dates of birth</li>
              <li>Government-issued identification documents</li>
              <li>Credit bureau account credentials or PINs</li>
              <li>Credit reports, scores, or any credit data</li>
            </ul>
            <p className="mt-3 leading-7 text-muted-foreground">
              Your interactions with credit bureau websites happen directly
              between you and the bureaus. 3Bfreeze guides you through the
              process but never acts as an intermediary for sensitive
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Data Security
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              We implement industry-standard security measures to protect the
              limited data we hold. All data is encrypted in transit using TLS
              and encrypted at rest. Access to production systems is restricted
              and audited. We conduct regular security reviews and follow best
              practices for application security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Your Rights
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              You have the right to access, export, and delete your personal
              data at any time. You can export all data associated with your
              account from your account settings. You can delete your account
              entirely, which permanently removes all of your data from our
              systems. If you need assistance exercising these rights, contact us
              at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Contact Us
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              If you have questions about this Privacy Policy or your personal
              data, please reach out through our{" "}
              <Link
                href="/contact"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </InfoPageShell>
  );
}
