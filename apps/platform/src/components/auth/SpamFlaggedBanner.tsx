"use client";

import { useSession } from "next-auth/react";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SpamFlaggedBanner() {
  const { data: session } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user is spam-flagged
  const isFlagged =
    (session?.user as any)?.isFlagged ||
    (session?.user as any)?.is_spam_flagged;

  // Don't show banner if user is not flagged, not authenticated, or banner is dismissed
  if (!session || !isFlagged || isDismissed) {
    return null;
  }

  return (
    <div className="relative">
      <Alert className="rounded-none border-l-0 border-r-0 border-t-0 border-b border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200 pr-8">
          <span className="font-medium">Account Under Review:</span> Your
          account has been flagged for review. Some features may be limited
          while we verify your activity.
          <a
            href="/contact"
            className="underline hover:no-underline ml-1 font-medium"
          >
            Contact support
          </a>{" "}
          if you believe this is an error.
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </Alert>
    </div>
  );
}
