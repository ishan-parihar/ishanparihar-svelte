"use client";

import { useSession } from "next-auth/react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { usePathname } from "next/navigation";

/**
 * Hook to handle authentication requirements for engagement actions
 * Provides a clean interface for requiring authentication before actions
 */
export function useAuthRequirement() {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const pathname = usePathname();

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const isLoading = status === "loading";

  /**
   * Require authentication for an action
   * If user is not authenticated, shows sign-in modal
   * If user is authenticated, executes the callback immediately
   */
  const requireAuthForAction = (
    callback: () => void,
    options?: {
      message?: string;
      view?: "signIn" | "signUp";
      callbackUrl?: string;
    },
  ) => {
    if (isAuthenticated) {
      // User is authenticated, execute the callback immediately
      callback();
      return;
    }

    // User is not authenticated, show sign-in modal
    const view = options?.view || "signIn";
    const callbackUrl = options?.callbackUrl || pathname || "/";

    console.log(
      `[useAuthRequirement] Authentication required for action. Opening ${view} modal with callback: ${callbackUrl}`,
    );

    openAuthModal(view, callbackUrl);
  };

  /**
   * Check if user can perform an action
   * Returns true if authenticated, false otherwise
   */
  const canPerformAction = () => {
    return isAuthenticated;
  };

  /**
   * Get authentication status message for UI display
   */
  const getAuthStatusMessage = (action: string = "perform this action") => {
    if (isLoading) {
      return "Loading...";
    }

    if (!isAuthenticated) {
      return `Sign in to ${action}`;
    }

    return "";
  };

  return {
    isAuthenticated,
    isLoading,
    requireAuthForAction,
    canPerformAction,
    getAuthStatusMessage,
  };
}
