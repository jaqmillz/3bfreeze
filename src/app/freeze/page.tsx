import type { Metadata } from "next";
import { FreezeFlowClient } from "@/components/freeze-flow-client";

export const metadata: Metadata = {
  title: "Freeze Your Credit | 3Bfreeze",
  description:
    "Freeze your credit at all three bureaus for free in about 15 minutes. No account required.",
};

export default function FreezePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <FreezeFlowClient />
    </div>
  );
}
