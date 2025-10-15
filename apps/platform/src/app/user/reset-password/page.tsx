"use client";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useSearchParams } from "next/navigation";

// Metadata is now handled in layout.tsx since this is a client component

export default function ResetPasswordPage() {
  // Use the useSearchParams hook to safely access search parameters
  const searchParams = useSearchParams();

  // Extract token from searchParams
  const tokenParam = searchParams ? searchParams.get("token") : null;

  // Token is already a string or null, convert null to undefined
  const token = tokenParam || undefined;

  console.log(
    "Reset password page loaded with token:",
    token ? `${token.substring(0, 8)}...` : "none",
  );

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new password for your account
          </p>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
