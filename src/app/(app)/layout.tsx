import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav, AppSidebar } from "@/components/app-nav";
import { Footer } from "@/components/footer";

export default async function AppLayout({
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
          <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-6">{children}</main>
          <Footer isAuthenticated />
        </div>
      </div>
    </div>
  );
}
