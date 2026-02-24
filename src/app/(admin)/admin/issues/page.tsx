import { createServiceClient } from "@/lib/supabase/admin";
import { IssuesClient } from "./issues-client";

export default async function IssuesPage() {
  const supabase = createServiceClient();

  const { data: issues } = await supabase
    .from("freeze_issues")
    .select("id, user_id, bureau, issue_type, issue_details, source, created_at")
    .order("created_at", { ascending: false });

  // Get user emails for authenticated issues
  const userIds = [...new Set(
    (issues ?? []).map((i) => i.user_id).filter(Boolean)
  )];
  const { data: users } = userIds.length > 0
    ? await supabase
        .from("users")
        .select("id, email")
        .in("id", userIds)
    : { data: [] };

  const userMap: Record<string, string> = {};
  for (const u of users ?? []) {
    userMap[u.id] = u.email;
  }

  const issuesForClient = (issues ?? []).map(({ user_id, ...issue }) => ({
    ...issue,
    email: user_id ? (userMap[user_id] ?? "Unknown") : null,
  }));

  return <IssuesClient issues={issuesForClient} />;
}
