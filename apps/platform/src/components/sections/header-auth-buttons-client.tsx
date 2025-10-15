"use client";

import { useAuthModal } from "@/contexts/AuthModalContext";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle2 } from "lucide-react";
import Link from "next/link";

export function HeaderAuthButtonsClient() {
  const { openAuthModal } = useAuthModal();
  const { isLoading, isLoggedIn } = useSession();

  // Show skeleton while loading to prevent FOUC
  if (isLoading) {
    return (
      <div className="ml-1">
        <Skeleton className="w-32 h-9 rounded-md" />
      </div>
    );
  }

  // If user is authenticated, show account link
  if (isLoggedIn) {
    return (
      <div className="ml-1">
        <Button
          asChild
          size="sm"
          variant="default"
          className="w-32 h-9 px-3 py-2 flex items-center justify-center bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          <Link
            href="/account"
            className="flex items-center justify-center gap-1.5"
          >
            <UserCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Account</span>
          </Link>
        </Button>
      </div>
    );
  }

  // If user is not authenticated, show sign in button
  return (
    <div className="ml-1">
      <Button
        size="sm"
        variant="default"
        className="w-32 h-9 px-3 py-2 flex items-center justify-center bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
        onClick={() => openAuthModal("signIn", "/account")}
      >
        <div className="flex items-center justify-center gap-1.5">
          <UserCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Sign In</span>
        </div>
      </Button>
    </div>
  );
}
