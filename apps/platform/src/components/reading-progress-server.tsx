import React from "react";
import { ReadingProgressClient } from "./reading-progress-client";

export function ReadingProgressServer() {
  return (
    <>
      {/* Static progress bar for SSR - optimized for smooth animations */}
      <div
        className="fixed top-0 left-0 z-[9999] h-1.5 w-full reading-progress-bar"
        style={{
          transform: "translate3d(-100%, 0, 0)",
          background: "linear-gradient(to right, #0ea5e9, #38bdf8)",
          boxShadow: "0 0 8px rgba(14, 165, 233, 0.6)",
          willChange: "transform",
          backfaceVisibility: "hidden",
          perspective: "1000px",
        }}
      />

      {/* Client component for interactivity */}
      <ReadingProgressClient />
    </>
  );
}
