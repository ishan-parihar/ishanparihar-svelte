"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthModal } from "@/contexts/AuthModalContext";

/**
 * Hook to handle authentication modal triggers
 * This hook should be used in client components that need to trigger the authentication modal
 * based on URL parameters or other conditions.
 *
 * @returns {Object} Authentication modal trigger utilities
 */
export function useAuthModalTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openAuthModal } = useAuthModal();

  // Check for auth parameters in the URL and trigger the modal
  useEffect(() => {
    // Check if searchParams exists before using it
    if (!searchParams) return;

    const requireAuth = searchParams.get("requireAuth");
    const callbackUrl = searchParams.get("callbackUrl");
    const authView = searchParams.get("authView") as "signIn" | "signUp" | null;

    // If requireAuth is present, open the auth modal with the specified view
    if (requireAuth === "true") {
      // Use the specified view or default to signIn
      openAuthModal(authView || "signIn", callbackUrl || undefined);
      console.log(
        `Opening auth modal with view: ${authView || "signIn"}, callbackUrl: ${callbackUrl || "none"}`,
      );

      // Clear the URL parameters after opening the modal
      // This prevents stale parameters from affecting subsequent modal triggers
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("requireAuth");
      newUrl.searchParams.delete("callbackUrl");
      newUrl.searchParams.delete("authView");

      // Use router.replace to update the URL without a full page reload
      router.replace(pathname + (newUrl.search !== "?" ? newUrl.search : ""), {
        scroll: false,
      });
      console.log("Cleared URL parameters after opening auth modal");
    }
  }, [searchParams, openAuthModal, router, pathname]);

  // Function to trigger the auth modal directly
  const triggerAuthModal = (
    view: "signIn" | "signUp" = "signIn",
    callbackUrl?: string,
  ) => {
    openAuthModal(view, callbackUrl || pathname || "");
  };

  return {
    triggerAuthModal,
  };
}
