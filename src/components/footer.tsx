"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Footer({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <footer className="border-t bg-primary/[0.04]">
      <div className="mx-auto max-w-5xl px-6 py-5 sm:py-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="shrink-0">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="inline-flex items-center gap-2 font-bold text-sm">
              <Shield className="h-4 w-4 text-primary" />
              3Bfreeze
            </Link>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Free credit freeze management.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <ul className="space-y-1.5">
              <li>
                <Link href={isAuthenticated ? "/freeze-workflow" : "/signup"} className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Get Started Free
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                {isAuthenticated ? (
                  <button onClick={handleSignOut} className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                    Log Out
                  </button>
                ) : (
                  <Link href="/login" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                    Log In
                  </Link>
                )}
              </li>
            </ul>

            <ul className="space-y-1.5">
              <li>
                <Link href="/privacy" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 border-t border-primary/10 pt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-muted-foreground">
            &copy; {new Date().getFullYear()} 3Bfreeze.com &middot; Not affiliated with Equifax, TransUnion, or Experian.
          </p>
          <Link href="/admin" className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
