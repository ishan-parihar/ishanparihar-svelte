"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";

/**
 * Client component wrapper for SpeedInsights that handles errors
 */
export default function SpeedInsightsWrapper() {
  useEffect(() => {
    // Set up a global error handler to detect if Speed Insights is blocked
    const handleError = (event: ErrorEvent) => {
      if (
        event.filename &&
        (event.filename.includes("speed-insights") ||
          event.filename.includes("vercel-insights") ||
          event.message?.includes("speed-insights"))
      ) {
        console.log(
          "Speed Insights script blocked by client, error suppressed",
        );
        event.preventDefault();
        return true;
      }
      return false;
    };

    window.addEventListener("error", handleError, true);

    return () => {
      window.removeEventListener("error", handleError, true);
    };
  }, []);

  return <SpeedInsights />;
}
