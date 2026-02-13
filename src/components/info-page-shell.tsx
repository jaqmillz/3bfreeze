import { createClient } from "@/lib/supabase/server";
import { AppNav, AppSidebar } from "@/components/app-nav";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Shield } from "lucide-react";

export async function InfoPageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const userName =
      profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.first_name ?? undefined;

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppNav userName={userName} />
        <div className="flex flex-1">
          <AppSidebar userName={userName} />
          <div className="flex flex-1 flex-col">
            <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
              {children}
            </main>
            <Footer isAuthenticated />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <Shield className="h-6 w-6 text-primary" />
            3Bfreeze
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
