"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { AccountSuspendedPage } from "@/components/auth/AccountSuspendedPage";
import { AccountSpamFlaggedPage } from "@/components/auth/AccountSpamFlaggedPage";

function ErrorPageContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log("Auth error page loaded with params:", {
      error: errorParam,
      error_description: errorDescription,
    });

    if (errorParam) {
      switch (errorParam) {
        case "Configuration":
          // Check for specific error description that might indicate PKCE issues
          if (
            errorDescription &&
            errorDescription.includes("pkceCodeVerifier")
          ) {
            setError(
              "There was a problem with the authentication process. This may happen when signing in from a new device. Please try again or clear your browser cookies and try again.",
            );
          } else {
            setError(
              "There is a problem with the server configuration. Please try again later or contact support.",
            );
          }
          break;
        case "AccessDenied":
          setError("You do not have access to this resource.");
          break;
        case "Verification":
          setError(
            "The verification link may have expired or already been used.",
          );
          break;
        case "OAuthSignin":
          setError(
            "There was a problem starting the Google sign-in process. Please try again or use a different sign-in method.",
          );
          break;
        case "OAuthCallback":
          setError(
            "There was a problem completing the Google sign-in process. This may happen when signing in from a new device. Please try again.",
          );
          break;
        case "OAuthCreateAccount":
          setError(
            "There was a problem creating your account with Google. Please try again or contact support.",
          );
          break;
        case "EmailCreateAccount":
          setError(
            "There was a problem creating your account with email. Please try again or contact support.",
          );
          break;
        case "Callback":
          setError(
            "There was a problem with the authentication callback. Please try again or use a different browser.",
          );
          break;
        case "OAuthAccountNotLinked":
          setError(
            "The email associated with your Google account is already registered with a different sign-in method. Please use your original sign-in method.",
          );
          break;
        case "EmailSignin":
          setError("The email could not be sent or the email link expired.");
          break;
        case "CredentialsSignin":
          setError("The email or password you entered is incorrect.");
          break;
        case "SessionRequired":
          setError("Please sign in to access this page.");
          break;
        case "AccountSuspended":
          setError("suspended");
          break;
        case "AccountSpamFlagged":
          setError("spam_flagged");
          break;
        default:
          setError(
            errorDescription ||
              "An unexpected error occurred. Please try again.",
          );
          break;
      }
    } else {
      setError(
        "An unknown error occurred. Please try again or contact support.",
      );
    }
  }, [searchParams]);

  // Render specialized pages for account status issues
  if (error === "suspended") {
    return <AccountSuspendedPage />;
  }

  if (error === "spam_flagged") {
    return <AccountSpamFlaggedPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error}
          </p>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          {error?.includes("suspended") ? (
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Contact Support
            </Link>
          ) : (
            <Link
              href="/?requireAuth=true&authView=signIn"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Sign In
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ErrorPageContent />
    </Suspense>
  );
}
