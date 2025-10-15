import React from "react";
import { Share2 } from "lucide-react";
import { MobileBottomBarClient } from "./MobileBottomBarClient";

// Server component that renders the static structure
export default function MobileBottomBarServer({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  return (
    <>
      {/* Static bottom bar structure for SSR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 shadow-lg z-50 lg:hidden">
        <div className="flex justify-around items-center h-14">
          {/* Share Button - full width */}
          <button className="flex flex-col items-center justify-center w-full h-full text-sm font-medium">
            <Share2 className="h-5 w-5 mb-0.5 text-primary" />
            <span>Share Article</span>
          </button>
        </div>
      </div>

      {/* Client component for interactivity */}
      <MobileBottomBarClient title={title} slug={slug} />

      {/* Add padding to the bottom of the page to account for the fixed bar */}
      <div className="h-14 w-full lg:hidden"></div>
    </>
  );
}
