"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthModal } from "@/contexts/AuthModalContext";

/**
 * Hook to handle authentication requirements
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Whether authentication is required
 * @param {string} options.redirectTo - Where to redirect after successful auth (defaults to current path)
 * @param {boolean} options.openModal - Whether to open the auth modal if not authenticated
 * @param {'signIn' | 'signUp'} options.modalView - Which view to show in the modal
 * @returns {Object} Authentication state and utility functions
 */
export function useRequireAuth({
  requireAuth = true,
  redirectTo,
  openModal = true,
  modalView = "signIn",
}: {
  requireAuth?: boolean;
  redirectTo?: string;
  openModal?: boolean;
  modalView?: "signIn" | "signUp";
} = {}) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip if we're still loading the session
    if (status === "loading") {
      return;
    }

    // Set loading to false now that we have session status
    setIsLoading(false);

    // If authentication is required but user is not authenticated
    if (requireAuth && status !== "authenticated") {
      if (openModal) {
        // Use the redirectTo path or current path as the callback URL
        const callbackUrl = redirectTo || pathname || "";
        // Open the auth modal with the specified view and callback URL
        openAuthModal(modalView, callbackUrl);
        console.log(
          `useRequireAuth: Opening auth modal with view: ${modalView}, callbackUrl: ${callbackUrl}`,
        );
      }
      return;
    }

    // If user is authenticated and we have a redirectTo path
    if (status === "authenticated" && redirectTo) {
      router.push(redirectTo);
    }
  }, [
    status,
    requireAuth,
    openModal,
    modalView,
    openAuthModal,
    router,
    redirectTo,
    pathname,
  ]);

  return {
    session,
    status,
    isLoading,
    isAuthenticated: status === "authenticated",
    // Utility function to require auth for a specific action
    requireAuthForAction: (
      callback: () => void,
      actionCallbackUrl?: string,
    ) => {
      if (status === "authenticated") {
        callback();
      } else {
        // Use the provided callback URL, redirectTo, or current path
        const callbackUrl = actionCallbackUrl || redirectTo || pathname || "";
        openAuthModal(modalView, callbackUrl);
        console.log(
          `requireAuthForAction: Opening auth modal with view: ${modalView}, callbackUrl: ${callbackUrl}`,
        );
      }
    },
  };
}
