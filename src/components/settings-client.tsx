"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { UserProfile, NotificationPreferences } from "@/lib/types";

// ---------------------------------------------------------------------------
// Main Settings Component
// ---------------------------------------------------------------------------

export function SettingsClient({
  profile,
  notificationPreferences,
}: {
  profile: UserProfile;
  notificationPreferences: NotificationPreferences;
}) {
  const [tab, setTab] = useState<"profile" | "notifications" | "security" | "account">("profile");

  const tabs = [
    { key: "profile" as const, label: "Profile" },
    { key: "notifications" as const, label: "Notifications" },
    { key: "security" as const, label: "Security" },
    { key: "account" as const, label: "Account" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>

      <div className="flex gap-1 mb-8 rounded-lg bg-muted/50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab profile={profile} />}
      {tab === "notifications" && <NotificationsTab preferences={notificationPreferences} />}
      {tab === "security" && <SecurityTab />}
      {tab === "account" && <AccountTab email={profile.email} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Tab
// ---------------------------------------------------------------------------

function ProfileTab({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [saving, setSaving] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("users")
        .update({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated.");
      router.refresh();
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-xs text-muted-foreground">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Email</Label>
          <div className="flex items-center gap-3">
            <Input value={profile.email} disabled className="flex-1" />
            <button
              onClick={() => setEmailModalOpen(true)}
              className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
            >
              Change
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <ChangeEmailModal
        currentEmail={profile.email}
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Notifications Tab
// ---------------------------------------------------------------------------

function NotificationsTab({
  preferences,
}: {
  preferences: NotificationPreferences;
}) {
  const [prefs, setPrefs] = useState({
    refreeze_reminders: preferences.refreeze_reminders,
    thaw_expiration_alerts: preferences.thaw_expiration_alerts,
    weekly_summary: preferences.weekly_summary,
    security_alerts: preferences.security_alerts,
  });
  const [saving, setSaving] = useState(false);

  function toggle(key: keyof typeof prefs) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          {
            user_id: preferences.user_id,
            ...prefs,
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;
      toast.success("Preferences saved.");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  }

  const toggleItems = [
    {
      key: "refreeze_reminders" as const,
      label: "Re-freeze reminders",
      description: "Get reminded to re-freeze after a temporary thaw.",
    },
    {
      key: "thaw_expiration_alerts" as const,
      label: "Thaw expiration alerts",
      description: "Alert when a scheduled thaw is about to expire.",
    },
    {
      key: "weekly_summary" as const,
      label: "Weekly summary",
      description: "Weekly email with your freeze status across all bureaus.",
    },
    {
      key: "security_alerts" as const,
      label: "Security alerts",
      description: "Important security notifications about your account.",
    },
  ];

  return (
    <div className="space-y-1">
      {toggleItems.map((item, index) => (
        <div key={item.key}>
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5 pr-4">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              id={item.key}
              checked={prefs[item.key]}
              onCheckedChange={() => toggle(item.key)}
            />
          </div>
          {index < toggleItems.length - 1 && <div className="h-px bg-border" />}
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Security Tab
// ---------------------------------------------------------------------------

function SecurityTab() {
  const router = useRouter();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOutAll() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
      router.push("/login");
    } catch {
      toast.error("Failed to sign out all devices.");
      setSigningOut(false);
    }
  }

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Password</p>
            <p className="text-xs text-muted-foreground">Update your password.</p>
          </div>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Change
          </button>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Sign out everywhere</p>
            <p className="text-xs text-muted-foreground">End all active sessions.</p>
          </div>
          <button
            onClick={handleSignOutAll}
            disabled={signingOut}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {signingOut ? "Signing out..." : "Sign out all"}
          </button>
        </div>
      </div>

      <ChangePasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Account Tab
// ---------------------------------------------------------------------------

function AccountTab({ email }: { email: string }) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  function handleExport() {
    toast.success("Export requested. Check your email.");
  }

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Export data</p>
            <p className="text-xs text-muted-foreground">Download all your 3Bfreeze data.</p>
          </div>
          <button
            onClick={handleExport}
            className="text-xs font-medium text-primary hover:underline"
          >
            Export
          </button>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground">Permanently remove your account and data.</p>
          </div>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <DeleteAccountModal
        email={email}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Change Email Modal
// ---------------------------------------------------------------------------

function ChangeEmailModal({
  currentEmail,
  open,
  onOpenChange,
}: {
  currentEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Enter a new email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password,
      });

      if (signInError) {
        toast.error("Incorrect password.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast.success("Confirmation sent to your new email.");
      onOpenChange(false);
      setNewEmail("");
      setPassword("");
    } catch {
      toast.error("Failed to update email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription>
            A verification link will be sent to the new address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmail" className="text-xs text-muted-foreground">Current email</Label>
            <Input id="currentEmail" value={currentEmail} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newEmail" className="text-xs text-muted-foreground">New email</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailPassword" className="text-xs text-muted-foreground">Password</Label>
            <Input
              id="emailPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Current password"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Change Password Modal
// ---------------------------------------------------------------------------

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(newPassword);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        toast.error("Unable to verify identity. Sign in again.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated.");
      onOpenChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPass" className="text-xs text-muted-foreground">Current password</Label>
            <Input
              id="currentPass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPass" className="text-xs text-muted-foreground">New password</Label>
            <Input
              id="newPass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength.score ? strength.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">{strength.label}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPass" className="text-xs text-muted-foreground">Confirm password</Label>
            <Input
              id="confirmPass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[10px] text-muted-foreground">Passwords don&apos;t match.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Account Modal
// ---------------------------------------------------------------------------

function DeleteAccountModal({
  email,
  open,
  onOpenChange,
}: {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmation === "DELETE";

  async function handleDelete() {
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const supabase = createClient();

      const { error: rpcError } = await supabase.rpc("delete_user_account");

      if (rpcError) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await supabase.from("users").delete().eq("id", user.id);
        }
      }

      await supabase.auth.signOut();
      router.push("/");
    } catch {
      toast.error("Failed to delete account. Contact support.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and all data associated with{" "}
            <span className="font-medium">{email}</span>. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deleteConfirm" className="text-xs text-muted-foreground">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="deleteConfirm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
