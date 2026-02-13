import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-primary/[0.04]">
      <div className="mx-auto max-w-5xl px-6 py-5 sm:py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-sm">
              <Shield className="h-4 w-4 text-primary" />
              3Bfreeze
            </Link>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Free credit freeze management. Protect your identity at all three major bureaus.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </h4>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/signup" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/privacy" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-foreground/70 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Security
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs text-foreground/70">
              <li>No SSN stored</li>
              <li>Encrypted in transit</li>
              <li>Free by federal law</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-primary/10 pt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-muted-foreground">
            &copy; {new Date().getFullYear()} 3Bfreeze.com
          </p>
          <p className="text-[10px] text-muted-foreground">
            Not affiliated with Equifax, TransUnion, or Experian.
          </p>
        </div>
      </div>
    </footer>
  );
}
