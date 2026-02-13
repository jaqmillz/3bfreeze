import Link from "next/link";
import { InfoPageShell } from "@/components/info-page-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About - 3Bfreeze",
  description:
    "Your simple solution for pro-active credit security. We empower you to easily freeze your credit at all three major bureaus.",
};

export default function AboutPage() {
  return (
    <InfoPageShell>
      <div className="mx-auto max-w-2xl space-y-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Stop ID theft before it happens
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            3Bfreeze is your simple solution for pro-active credit security. We
            empower you to easily freeze your credit report on all three major
            credit bureaus, giving you peace of mind and control over your
            financial identity.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              The problem
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              The bureaus make freezing deliberately difficult. Three separate
              websites, three separate accounts, upsell screens at every step
              pushing paid monitoring products you don&apos;t need. They profit
              from selling your data to lenders, so they have every incentive to
              keep your file accessible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Our solution
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              We provide a freeze workflow that bypasses the monitoring pitches
              and goes straight to each bureau&apos;s freeze page. One place to
              manage your status across all three bureaus. Reminders when a
              temporary thaw expires. No subscriptions, no upsells, no dark
              patterns. And it&apos;s free by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Your data stays yours
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              We never see your Social Security Number, date of birth, or bureau
              credentials. All your passwords are stored in your browser, not
              with us. Your interactions with bureau websites happen directly
              between you and them.
            </p>
          </section>
        </div>

        <div className="border-t pt-8">
          <Link href="/contact">
            <Button variant="outline" size="lg" className="gap-2">
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </InfoPageShell>
  );
}
