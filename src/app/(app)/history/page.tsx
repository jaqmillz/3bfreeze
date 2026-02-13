import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistoryClient } from "@/components/history-client";
import type { ActivityLogEntry } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: activityLog } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <HistoryClient entries={(activityLog as ActivityLogEntry[]) ?? []} />
  );
}
