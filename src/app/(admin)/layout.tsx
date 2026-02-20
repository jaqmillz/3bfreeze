import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Defense-in-depth: middleware also checks, but verify here too
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-bold tracking-tight"
            >
              3Bfreeze Admin
            </Link>
            <nav className="flex items-center gap-3 text-xs">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/breaches"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Breach Codes
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to app
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
      <Footer isAuthenticated />
    </div>
  );
}
