"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-lg font-semibold">Admin Error</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Failed to load the admin dashboard. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
