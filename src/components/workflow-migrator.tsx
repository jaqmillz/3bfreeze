"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  loadState as loadBreachState,
  clearState as clearBreachState,
} from "@/lib/breach-workflow-storage";
import {
  loadState as loadFreezeState,
  clearState as clearFreezeState,
} from "@/lib/freeze-flow-storage";

/**
 * Client component that migrates anonymous workflow progress from localStorage
 * to the database after any authentication (login, signup, or OAuth).
 * Runs once on mount inside the authenticated (app) layout.
 */
export function WorkflowMigrator({ userId }: { userId: string }) {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const breachState = loadBreachState();
    const freezeState = loadFreezeState();

    // Nothing to migrate
    if (!breachState && !freezeState) return;

    async function migrate() {
      const supabase = createClient();

      try {
        // Fetch current bureau statuses so we only write when status actually changes
        const { data: existingStatuses } = await supabase
          .from("bureau_status")
          .select("bureau, status")
          .eq("user_id", userId);

        const currentStatus = new Map(
          (existingStatuses ?? []).map((s) => [s.bureau, s.status])
        );

        const state = breachState ?? freezeState;
        if (!state) return;
        // Only migrate direct freeze-flow state (not breach-sourced freeze state)
        if (!breachState && freezeState && freezeState.source !== "direct") return;

        // Migrate workflow progress
        await supabase.from("freeze_workflow_progress").upsert(
          {
            user_id: userId,
            current_step: state.currentStep,
            checklist_completed: state.checklistCompleted,
            equifax_completed: state.equifaxCompleted,
            transunion_completed: state.transunionCompleted,
            experian_completed: state.experianCompleted,
            completed_at: state.completedAt,
          },
          { onConflict: "user_id" }
        );

        // Migrate bureau statuses — only when status actually changes
        const now = new Date().toISOString();
        const bureaus = ["equifax", "transunion", "experian"] as const;
        for (const bureau of bureaus) {
          const key = `${bureau}Completed` as keyof typeof state;
          if (!state[key]) continue;

          const alreadyFrozen = currentStatus.get(bureau) === "frozen";
          if (alreadyFrozen) continue;

          await supabase.from("bureau_status").upsert(
            {
              user_id: userId,
              bureau,
              status: "frozen",
              status_updated_at: now,
              frozen_date: now,
            },
            { onConflict: "user_id,bureau" }
          );

          await supabase.from("activity_log").insert({
            user_id: userId,
            bureau,
            action: "frozen",
            source: "freeze_workflow",
          });
        }

        // Clear migrated localStorage state
        if (breachState) clearBreachState();
        if (freezeState) clearFreezeState();

        // Refresh server data so dashboard reflects migrated state
        router.refresh();
      } catch (err) {
        console.error("Workflow migration failed:", err);
      }
    }

    migrate();
  }, [userId, router]);

  return null;
}
