import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings-client";
import type { UserProfile, NotificationPreferences } from "@/lib/types";

const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, "id" | "user_id"> = {
  refreeze_reminders: true,
  thaw_expiration_alerts: true,
  weekly_summary: false,
  security_alerts: true,
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: notificationPrefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const userProfile: UserProfile = profile ?? {
    id: user.id,
    email: user.email ?? "",
    first_name: null,
    last_name: null,
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const preferences: NotificationPreferences = notificationPrefs ?? {
    id: "",
    user_id: user.id,
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  };

  return (
    <SettingsClient
      profile={userProfile}
      notificationPreferences={preferences}
    />
  );
}
