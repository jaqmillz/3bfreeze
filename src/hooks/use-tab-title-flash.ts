"use client";

import { useEffect, useRef } from "react";

/**
 * Flashes the browser tab title when the page is hidden to draw the user back.
 * Restores the original title when the page becomes visible again.
 */
export function useTabTitleFlash(active: boolean) {
  const originalTitle = useRef<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;

    originalTitle.current = document.title;
    let showFlash = false;

    function startFlashing() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        showFlash = !showFlash;
        document.title = showFlash
          ? "Come back to finish freezing!"
          : originalTitle.current;
      }, 1500);
    }

    function stopFlashing() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.title = originalTitle.current;
      showFlash = false;
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        startFlashing();
      } else {
        stopFlashing();
      }
    }

    // If already hidden when hook activates, start immediately
    if (document.hidden) {
      startFlashing();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopFlashing();
    };
  }, [active]);
}
