"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { BreachCode } from "@/lib/types";

interface BreachCodeWithStats extends BreachCode {
  visits: number;
  signups: number;
}

interface Props {
  breachCodes: BreachCodeWithStats[];
}

interface FormData {
  code: string;
  name: string;
  description: string;
  date: string;
  records_affected: string;
  data_exposed: string;
}

const emptyForm: FormData = {
  code: "",
  name: "",
  description: "",
  date: "",
  records_affected: "",
  data_exposed: "",
};

export function BreachesClient({ breachCodes }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(bc: BreachCodeWithStats) {
    setEditingId(bc.id);
    setForm({
      code: bc.code,
      name: bc.name,
      description: bc.description,
      date: bc.date,
      records_affected: bc.records_affected ?? "",
      data_exposed: bc.data_exposed.join(", "),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim() || !form.description.trim() || !form.date.trim()) {
      toast.error("Code, name, description, and date are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        date: form.date.trim(),
        records_affected: form.records_affected.trim() || null,
        data_exposed: form.data_exposed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingId) {
        // Use API route for update (needs service role)
        const res = await fetch("/api/admin/breach-codes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success("Breach code updated.");
      } else {
        const res = await fetch("/api/admin/breach-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        toast.success("Breach code created.");
      }

      setDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const res = await fetch("/api/admin/breach-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      toast.success(active ? "Breach code activated." : "Breach code deactivated.");
      router.refresh();
    } catch {
      toast.error("Failed to update status.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Breach Codes</h1>
          <p className="text-xs text-muted-foreground">
            Manage breach codes and landing pages
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Breach Code
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Visits</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Signups</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Active</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {breachCodes.map((bc) => (
              <tr key={bc.id} className="border-b last:border-0">
                <td className="px-4 py-2.5">
                  <span className="font-mono text-xs font-medium">{bc.code}</span>
                </td>
                <td className="px-4 py-2.5 text-xs">{bc.name}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{bc.date}</td>
                <td className="px-4 py-2.5 text-right text-xs tabular-nums">{bc.visits.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-xs tabular-nums">{bc.signups.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-center">
                  <Switch
                    checked={bc.active}
                    onCheckedChange={(checked) => toggleActive(bc.id, checked)}
                  />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(bc)} className="h-7 w-7 p-0">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {breachCodes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No breach codes yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingId ? "Edit Breach Code" : "New Breach Code"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingId
                ? "Update the breach code details."
                : "Create a new breach code and landing page."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="ACME2024"
                  className="font-mono text-xs"
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Input
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="January 2025"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Company Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Corp Data Breach"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="In January 2025, Acme Corp disclosed..."
                className="text-xs min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Records Affected</Label>
              <Input
                value={form.records_affected}
                onChange={(e) => setForm({ ...form, records_affected: e.target.value })}
                placeholder="2.4 million"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Data Exposed (comma-separated)</Label>
              <Input
                value={form.data_exposed}
                onChange={(e) => setForm({ ...form, data_exposed: e.target.value })}
                placeholder="SSN, Names, Addresses, Phone Numbers"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setDialogOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
