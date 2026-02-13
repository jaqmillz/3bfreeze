"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/logo-white.png" alt="3Bfreeze" width={400} height={120} className="h-10 w-auto" priority />
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#why-freeze" className="text-sm text-white/70 hover:text-white transition-colors">
            Why Freeze?
          </a>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-white text-primary hover:bg-white/90">Get Started</Button>
          </Link>
        </nav>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              <a
                href="#how-it-works"
                className="text-lg"
                onClick={() => setOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#why-freeze"
                className="text-lg"
                onClick={() => setOpen(false)}
              >
                Why Freeze?
              </a>
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
