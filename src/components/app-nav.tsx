"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Settings, LogOut, LayoutDashboard, Snowflake } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/freeze-workflow", label: "Freeze", icon: Snowflake },
];

export function AppNav({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white">
      <div className="relative flex h-16 items-center px-6">
        {/* Left: hamburger (mobile only) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden text-white hover:bg-white/10 hover:text-white">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-auto min-w-[180px] max-w-[220px] flex-col pt-8">
            <nav className="flex flex-1 flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-2.5 h-10 text-sm",
                      pathname.startsWith(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* User section at bottom */}
            <div className="border-t pt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{userName || "Account"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" onClick={() => setOpen(false)}>
                      <Settings className="mr-2 h-3.5 w-3.5" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: logo — absolutely centered on mobile, left-aligned on desktop */}
        <Link href="/dashboard" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:ml-0 flex shrink-0 items-center">
          <img src="/logo-white.png" alt="3Bfreeze" className="h-12 w-auto" />
        </Link>
      </div>
    </header>
  );
}

export function AppSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex sticky top-16 h-[calc(100vh-4rem)] w-52 shrink-0 flex-col border-r bg-primary/[0.06] px-3 py-4">
      <nav className="flex flex-1 flex-col gap-0.5">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-2.5 h-9 text-sm text-primary/70 hover:bg-primary/10 hover:text-primary",
                pathname.startsWith(link.href) &&
                  "bg-primary/10 text-primary font-semibold"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User at bottom */}
      <div className="border-t border-primary/10 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary">
              <Avatar className="h-7 w-7 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="truncate font-medium">{userName || "Account"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-44">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-3.5 w-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
