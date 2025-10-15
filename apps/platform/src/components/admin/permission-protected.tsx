"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import {
  PERMISSION_SCOPES,
  hasPermissionFromSession,
} from "@/lib/permissionService";
import { AlertCircle } from "lucide-react";

interface PermissionProtectedProps {
  requiredPermission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that protects its children based on the user's permissions.
 * If the user doesn't have the required permission, it will show a fallback or redirect to the admin dashboard.
 */
export function PermissionProtected({
  requiredPermission,
  children,
  fallback,
}: PermissionProtectedProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if the user has the required permission
  const hasPermission = useCallback(() => {
    // Use the client-safe utility function to check permissions
    return hasPermissionFromSession(session, requiredPermission);
  }, [session, requiredPermission]);

  useEffect(() => {
    // Only check permissions after the session has loaded
    if (status === "loading") return;

    // If the user doesn't have the required permission and there's no fallback,
    // redirect to the admin dashboard
    if (!hasPermission() && !fallback) {
      router.push("/admin");
    }
  }, [status, router, fallback, hasPermission]);

  // Show loading state while the session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If the user has the required permission, show the children
  if (hasPermission()) {
    return <>{children}</>;
  }

  // If the user doesn't have the required permission and there's a fallback, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise, show a permission denied message while redirecting
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Permission Denied</h2>
      <p className="text-gray-500 mb-4">
        You don't have the required permission to access this page.
      </p>
      <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
    </div>
  );
}
