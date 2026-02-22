import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { FreezeFlowClient } from "@/components/freeze-flow-client";

export const metadata: Metadata = {
  title: "Freeze Your Credit | 3Bfreeze",
  description:
    "Freeze your credit at all three bureaus for free in about 15 minutes. No account required.",
};

export default function FreezePage() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-primary text-white">
        <div className="flex h-12 items-center justify-center px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="h-4 w-4" />
            3Bfreeze
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <FreezeFlowClient />
      </div>
    </>
  );
}
