import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/animate";
import { GradientOrbs, GridPattern } from "@/components/gradient-bg";

export const metadata = {
  title: "About - 3Bfreeze",
  description:
    "Your simple solution for pro-active credit security. We empower you to easily freeze your credit at all three major bureaus.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative px-6 py-28 md:py-40">
          <GradientOrbs />
          <div className="relative z-10 mx-auto max-w-2xl">
            <FadeUp>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Stop ID theft before it happens
              </h1>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                3Bfreeze is your simple solution for pro-active credit
                security. We empower you to easily freeze your credit report on
                all three major credit bureaus, giving you peace of mind and
                control over your financial identity.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* Content sections */}
        <section className="relative border-t px-6 py-28 md:py-36">
          <GridPattern />
          <StaggerChildren className="relative z-10 mx-auto max-w-2xl space-y-20">
            <StaggerItem>
              <h2 className="text-2xl font-semibold tracking-tight">The problem</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                The bureaus make freezing deliberately difficult. Three
                separate websites, three separate accounts, upsell screens at
                every step pushing paid monitoring products you don&apos;t
                need. They profit from selling your data to lenders, so they
                have every incentive to keep your file accessible.
              </p>
            </StaggerItem>

            <StaggerItem>
              <h2 className="text-2xl font-semibold tracking-tight">Our solution</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                We provide a freeze workflow that bypasses the monitoring
                pitches and goes straight to each bureau&apos;s freeze page.
                One place to manage your status across all three bureaus.
                Reminders when a temporary thaw expires. No subscriptions, no
                upsells, no dark patterns. And it&apos;s free by law.
              </p>
            </StaggerItem>

            <StaggerItem>
              <h2 className="text-2xl font-semibold tracking-tight">Your data stays yours</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                We never see your Social Security Number, date of birth, or
                bureau credentials. All your passwords are stored in your
                browser, not with us. Your interactions with bureau websites
                happen directly between you and them.
              </p>
            </StaggerItem>
          </StaggerChildren>
        </section>

        {/* CTA */}
        <section className="relative border-t px-6 py-28 md:py-36">
          <GradientOrbs />
          <div className="relative z-10 mx-auto max-w-2xl">
            <FadeUp>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="gap-2">
                  Get in touch
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </FadeUp>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
