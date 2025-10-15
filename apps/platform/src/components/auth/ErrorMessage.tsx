"use client";

import { useSearchParams } from "next/navigation";

export const ErrorMessage = () => {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  // Define error messages for different error types
  const errorMessages: Record<string, string> = {
    unauthorized:
      "You are not authorized to access the admin area. Only the designated admin email can access this area.",
    google_auth_failed: "Google authentication failed. Please try again.",
    google_auth_not_configured:
      "Google authentication is not properly configured. Please contact the administrator.",
    token_exchange_failed:
      "Failed to authenticate with Google. Please try again.",
    user_info_failed:
      "Failed to retrieve user information from Google. Please try again.",
    invalid_credentials:
      "Invalid email or password. Please check your credentials and try again.",
    access_denied:
      "Access denied. Your account does not have permission to access this area.",
    invalid_password:
      "The password you entered is incorrect. Please try again.",
    admin_not_configured:
      "Admin authentication is not properly configured. Please contact the site administrator.",
    missing_env_vars:
      "Admin credentials are not properly configured in environment variables. Please contact the site administrator.",
  };

  const message = error
    ? errorMessages[error] || "An error occurred. Please try again."
    : null;

  if (message) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-none p-4 mb-6 shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400 dark:text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
