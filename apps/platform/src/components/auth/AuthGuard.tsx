"use client";

import { ReactNode } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  modalView?: "signIn" | "signUp";
}

/**
 * Component to protect routes or content that require authentication
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Content to show when authenticated
 * @param {ReactNode} props.fallback - Content to show when not authenticated (optional)
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Where to redirect after successful auth
 * @param {'signIn' | 'signUp'} props.modalView - Which view to show in the modal (default: 'signIn')
 */
export function AuthGuard({
  children,
  fallback,
  requireAuth = true,
  redirectTo,
  modalView = "signIn",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useRequireAuth({
    requireAuth,
    redirectTo,
    openModal: true,
    modalView,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Return fallback content if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Otherwise return a simple message
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to access this content.
        </p>
      </div>
    );
  }

  // If authentication is not required or user is authenticated
  return <>{children}</>;
}
