import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { verifyUserEmailServer } from "@/lib/auth-newsletter-server";

export const metadata: Metadata = {
  title: "Verify Email | Ishan Parihar",
  description: "Verify your email address to complete your account setup",
};

/**
 * Email Verification Page
 *
 * This page verifies a user's email address using the token from the URL.
 * It displays a success or error message based on the verification result.
 * If verification is successful, it shows a form to complete account setup.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // In Next.js App Router, searchParams should be awaited before accessing its properties
  const params = await searchParams;

  console.log("Verify page - searchParams:", params);

  // Check for success parameter first (this would be set by the API route)
  const successParam = params.success;
  const success = successParam === "true";

  // Get email from params if it exists
  const emailParam = params.email;
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam || "";

  // Get token if it exists
  const tokenParam = params.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  // Get error message if it exists
  const errorParam = params.error;
  const errorMessage = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  console.log("Verify page - Parsed params:", {
    success,
    email,
    token,
    errorMessage,
  });

  let message = "";

  // If we have a token but no success/email params, we need to verify the token
  if (token && !success && !errorMessage) {
    console.log("Verifying token:", token);
    // Verify the email
    const result = await verifyUserEmailServer(token);

    if (result.success && result.email) {
      // If verification was successful, show success message and redirect to sign in
      message =
        "Email verified successfully! You can now sign in to your account.";
    } else {
      // Set error message if verification failed
      message = result.message || "Verification failed. Please try again.";
    }
  } else if (success && email) {
    // If we already have success and email params, show success message
    message =
      "Email verified successfully! You can now sign in to your account.";
  } else if (errorMessage) {
    // If we have an error message, display it
    message = errorMessage;
  } else if (!token) {
    // If we don't have a token, display a message
    message =
      "Missing verification token. Please check your email and click the verification link again.";
  }

  // Otherwise show success/error message
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-none shadow-md p-8 text-center">
        <div className="mb-6">
          {message &&
          (message.includes("already verified") ||
            message.includes("successfully")) ? (
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          {message && message.includes("already verified")
            ? "Email Already Verified"
            : message && message.includes("successfully")
              ? "Email Verified Successfully"
              : "Verification Failed"}
        </h1>

        <div className="text-slate-600 dark:text-slate-300 mb-8">
          <p className="mb-4">
            {message ||
              "An error occurred during verification. Please try again or contact support."}
          </p>

          {message &&
          (message.includes("already verified") ||
            message.includes("successfully")) ? (
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              You can proceed to sign in with your account.
            </p>
          ) : message && message.includes("expired") ? (
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Verification links expire after 24 hours. Please request a new
              verification email.
            </p>
          ) : null}
        </div>

        <div className="flex justify-center">
          <Link
            href={
              message &&
              (message.includes("already verified") ||
                message.includes("successfully"))
                ? "/auth/signin"
                : "/"
            }
            className="inline-flex items-center px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {message &&
            (message.includes("already verified") ||
              message.includes("successfully"))
              ? "Go to Sign In"
              : "Return to Homepage"}
          </Link>
        </div>
      </div>
    </div>
  );
}
