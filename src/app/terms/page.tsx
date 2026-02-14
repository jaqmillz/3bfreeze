import Link from "next/link";
import { InfoPageShell } from "@/components/info-page-shell";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Terms of Service - 3Bfreeze",
  description:
    "Terms and conditions for using the 3Bfreeze credit freeze management service.",
};

export default function TermsPage() {
  return (
    <InfoPageShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: February 2026
        </p>

        <Separator className="my-8" />

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Acceptance of Terms
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              By accessing or using 3Bfreeze, you agree to be bound by these
              Terms of Service and our Privacy Policy. If you do not agree to
              these terms, you may not use the service. We reserve the right to
              update these terms at any time, and we will notify you of material
              changes via email or an in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Description of Service
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              3Bfreeze is a credit freeze management tool that provides guided
              workflows to help you freeze and unfreeze your credit files at the
              three major credit bureaus: Equifax, TransUnion, and Experian. The
              service includes freeze status tracking, step-by-step
              instructions, and unfreeze expiration reminders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              User Accounts
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              You must create an account to use 3Bfreeze. You are responsible for
              maintaining the confidentiality of your account credentials and for
              all activity that occurs under your account. You agree to provide
              accurate information during registration and to update it as
              needed. You must notify us immediately of any unauthorized use of
              your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Disclaimer
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              3Bfreeze is a guidance tool. We do not directly freeze or unfreeze
              your credit on your behalf. All freeze and unfreeze actions are
              performed by you directly on each credit bureau&#39;s website or
              phone system. We do not control, operate, or have any affiliation
              with Equifax, TransUnion, or Experian. We cannot guarantee the
              availability, accuracy, or functionality of any credit
              bureau&#39;s systems.
            </p>
            <p className="mt-3 leading-7 text-muted-foreground">
              The information provided through 3Bfreeze is for informational
              purposes only and does not constitute financial, legal, or
              professional advice. Credit bureau processes and requirements may
              change without notice, and our guidance may not always reflect the
              most current procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Limitation of Liability
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              To the fullest extent permitted by law, 3Bfreeze and its operators
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to
              loss of data, loss of profits, or damages arising from identity
              theft or unauthorized credit activity. Our total liability for any
              claim arising from or related to the service shall not exceed the
              amount you paid us in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Termination
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              You may delete your account at any time from your account settings.
              We reserve the right to suspend or terminate your account if you
              violate these terms, engage in abusive behavior, or use the service
              in a manner that could harm other users or our infrastructure. Upon
              termination, your data will be permanently deleted in accordance
              with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              If you have questions about these Terms of Service, please reach
              out through our{" "}
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
