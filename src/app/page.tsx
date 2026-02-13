import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lock,
  Snowflake,
  Bell,
  Check,
  X,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing-nav";
import { Footer } from "@/components/footer";
import { FadeUp, StaggerChildren, StaggerItem } from "@/components/animate";
import { HeroGradient, GradientOrbs, GridPattern } from "@/components/gradient-bg";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-20 sm:py-28">
        <HeroGradient />
        <FadeUp className="relative z-10">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Shield className="h-3 w-3 text-primary" />
            Free by federal law
          </div>
        </FadeUp>
        <FadeUp delay={0.1} className="relative z-10">
          <h1 className="max-w-3xl text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Stop ID theft before{" "}
            <span className="text-primary">it starts</span>
          </h1>
        </FadeUp>
        <FadeUp delay={0.2} className="relative z-10">
          <p className="mt-5 max-w-lg text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
            Freeze your credit at all three bureaus. No monitoring fees.
            No waiting for damage. Just prevention.
          </p>
        </FadeUp>
        <FadeUp delay={0.3} className="relative z-10">
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full gap-2 px-8 sm:w-auto">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full px-8 sm:w-auto">
                How it works
              </Button>
            </a>
          </div>
        </FadeUp>
        <FadeUp delay={0.4} className="relative z-10">
          <p className="mt-4 text-xs text-muted-foreground/60">
            No credit card required &middot; ~15 min setup
          </p>
        </FadeUp>
      </section>

      {/* Bureau strip */}
      <section className="border-y bg-muted/30 px-6 py-5">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {["Equifax", "TransUnion", "Experian"].map((name) => (
            <span
              key={name}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative px-6 py-16 sm:py-20">
        <FadeUp>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Three steps to credit security
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
            Skip the monitoring upsells. Go straight to each bureau&apos;s freeze page.
          </p>
        </FadeUp>

        <StaggerChildren className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              step: "01",
              title: "Create account",
              desc: "Sign up in seconds. No credit card needed.",
            },
            {
              icon: Snowflake,
              step: "02",
              title: "Freeze all three",
              desc: "Guided workflow walks you through each bureau.",
            },
            {
              icon: Bell,
              step: "03",
              title: "Stay protected",
              desc: "Track freeze status and get thaw reminders.",
            },
          ].map(({ icon: Icon, step, title, desc }) => (
            <StaggerItem key={title}>
              <div className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground/40">
                    {step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* Freeze vs Monitor */}
      <section id="why-freeze" className="relative border-t bg-muted/20 px-6 py-16 sm:py-20">
        <GridPattern />
        <div className="relative z-10">
          <FadeUp>
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary">
              Why freeze?
            </p>
            <h2 className="mt-3 text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Prevention beats detection
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
              Monitoring tells you after the damage. A freeze stops it from happening.
            </p>
          </FadeUp>

          <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
            {/* Monitoring card */}
            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-destructive/10 bg-card p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                    <ShieldOff className="h-4 w-4 text-destructive" />
                  </div>
                  <h3 className="text-sm font-semibold">Monitoring</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Alerts you after damage is done",
                    "Doesn\u2019t prevent unauthorized access",
                    "Often requires a paid subscription",
                    "You still dispute the fraud yourself",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        <X className="h-2.5 w-2.5 text-destructive" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* Freeze card */}
            <FadeUp delay={0.2}>
              <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm ring-1 ring-primary/5">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Freeze</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      Recommended
                    </span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Blocks credit file access entirely",
                    "Prevents new accounts from opening",
                    "Completely free by federal law",
                    "Lift or refreeze anytime you need",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Before You Start */}
      <section className="relative border-t px-6 py-16 sm:py-20">
        <div className="relative z-10 mx-auto max-w-sm">
          <FadeUp>
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary">
              Preparation
            </p>
            <h2 className="mt-3 text-center text-2xl font-bold tracking-tight sm:text-3xl">
              What you&apos;ll need
            </h2>
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Each bureau verifies your identity. Have these ready:
            </p>
          </FadeUp>

          <StaggerChildren className="mt-8 space-y-2">
            {[
              "Social Security Number",
              "Date of birth",
              "Current address",
              "Phone number",
              "Email address",
            ].map((item) => (
              <StaggerItem key={item}>
                <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:border-primary/20">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-sm">{item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>

          <FadeUp delay={0.2}>
            <p className="mt-5 text-center text-xs text-muted-foreground">
              Entered directly on each bureau&apos;s site. We never see or store your data.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t px-6 py-16 sm:py-20">
        <GradientOrbs />
        <div className="relative z-10 mx-auto max-w-md text-center">
          <FadeUp>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to take control?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Free. No credit card. About 15 minutes for all three bureaus.
            </p>
            <div className="mt-6">
              <Link href="/signup">
                <Button size="lg" className="gap-2 px-8">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
