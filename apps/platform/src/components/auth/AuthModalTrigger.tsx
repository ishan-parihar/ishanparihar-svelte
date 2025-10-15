"use client";

import { useAuthModalTrigger } from "@/hooks/useAuthModalTrigger";

/**
 * Component to handle authentication modal triggers
 * This component should be included in the layout to ensure the authentication modal
 * is triggered consistently across the entire site.
 */
export function AuthModalTrigger() {
  // Use the auth modal trigger hook to handle authentication modal triggers
  useAuthModalTrigger();

  // This component doesn't render anything
  return null;
}
