"use client";

import Link from "next/link";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white">
      <div className="relative flex h-12 items-center px-4">
        {/* Mobile: hamburger on the left */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden text-white hover:bg-white/10 hover:text-white">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[220px] flex-col px-3 py-4" aria-describedby={undefined}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav className="flex flex-1 flex-col gap-0.5">
              <a
                href="#how-it-works"
                className="flex h-9 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                onClick={() => setOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#why-freeze"
                className="flex h-9 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Why Freeze?
              </a>
            </nav>

            <div className="flex flex-col gap-2 border-t border-primary/10 pt-3">
              <Link href="/login" onClick={() => setOpen(false)}>
                <button className="flex h-9 w-full items-center justify-center rounded-lg border border-primary/20 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
                  Log In
                </button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <button className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo: centered on mobile, left on desktop */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:ml-0 flex shrink-0 items-center">
          <img src="/logo-white.png" alt="3Bfreeze" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 ml-auto">
          <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#why-freeze" className="text-sm text-white/70 hover:text-white transition-colors">
            Why Freeze?
          </a>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 hover:text-white">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-white text-primary font-semibold hover:bg-white/90 gap-1.5">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
