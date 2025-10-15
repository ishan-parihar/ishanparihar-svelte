"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

export default function UserErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "Configuration":
          setError("There is a problem with the server configuration.");
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
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
        case "OAuthAccountNotLinked":
          setError(
            "There was a problem with the authentication service. Please try again.",
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
        default:
          setError("An unexpected error occurred.");
          break;
      }
    } else {
      setError("An unknown error occurred.");
    }
  }, [searchParams]);

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
        <div className="mt-8 flex justify-center">
          <Link
            href="/user/signin"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
