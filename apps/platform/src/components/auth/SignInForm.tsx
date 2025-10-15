"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "./GoogleSignInButton";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { trackLogin } from "@/lib/analytics";

interface SignInFormProps {
  callbackUrl?: string;
  onGoogleSignIn?: () => void;
  inModal?: boolean;
  onSwitchToSignUp?: () => void;
}

export const SignInForm = ({
  callbackUrl = "/account",
  onGoogleSignIn,
  inModal = false,
  onSwitchToSignUp,
}: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAdminSignInAttempt, setIsAdminSignInAttempt] = useState(false);
  const router = useRouter();

  // Check for adminSignInAttempt cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(";");
    const adminSignInAttempt = cookies.find((cookie) =>
      cookie.trim().startsWith("adminSignInAttempt="),
    );

    if (adminSignInAttempt) {
      console.log("Admin sign-in attempt detected");
      setIsAdminSignInAttempt(true);

      // Clear the cookie
      document.cookie =
        "adminSignInAttempt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Show a message to the user
      setError(
        "Please sign in with your admin account to access the admin area",
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log("Attempting to sign in with email:", email);

      // CRITICAL: Clear ALL cookies to ensure a completely clean state
      // This is essential to prevent any cookie conflicts
      console.log("Clearing all cookies for admin sign-in");

      const cookiesToClear = [
        // Admin-specific NextAuth cookies
        "admin.session-token",
        "admin.callback-url",
        "admin.csrf-token",
        // User-specific NextAuth cookies
        "user.session-token",
        "user.callback-url",
        "user.csrf-token",
        // Legacy NextAuth cookies
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
        // Admin cookies
        "adminAuthenticated",
        "adminEmail",
        "admin_session",
        // User cookies
        "userAuthenticated",
        "userEmail",
        "userName",
        "userPicture",
        "userProvider",
        "userAuthToken",
        // Legacy Better Auth cookies
        "better-auth.session_token",
      ];

      cookiesToClear.forEach((cookieName) => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

      // Use the callbackUrl prop passed from the parent component
      console.log("Using callbackUrl from props:", callbackUrl);

      // Check if password is provided
      if (password) {
        // Use credentials provider for password-based login
        console.log("Using credentials provider for password-based login");
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });

        if (res?.error) {
          console.error("Sign-in error:", res.error);
          setError(
            res.error === "CredentialsSignin"
              ? "Invalid email or password. Please try again."
              : res.error,
          );
          setIsLoading(false);
        } else if (res?.url) {
          console.log("Sign-in successful, redirecting to:", res.url);

          // Set cookies directly in the browser for both admin and user authentication
          // This allows admin users to access both admin and user routes
          document.cookie = `adminEmail=${encodeURIComponent(email)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          document.cookie = `adminAuthenticated=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

          // Also set user cookies to allow admin to access user routes
          document.cookie = `userEmail=${encodeURIComponent(email)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          document.cookie = `userAuthenticated=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

          // Track login event
          try {
            await trackLogin("credentials");
          } catch (trackError) {
            console.error("[SignInForm] Error tracking login:", trackError);
          }

          // Redirect to the callback URL
          // Note: We're not using router.replace() here because we want a full page reload
          // to ensure all cookies and session state are properly initialized
          console.log("[SignInForm] Redirecting to:", res.url);
          window.location.href = res.url;
        }
      } else {
        // Use email provider for passwordless login (magic link)
        console.log("Using email provider for passwordless login");
        const res = await signIn("email", {
          redirect: false,
          email,
          callbackUrl,
        });

        if (res?.error) {
          console.error("Email sign-in error:", res.error);
          setError(res.error);
          setIsLoading(false);
        } else {
          console.log("Email sign-in initiated, check your inbox");
          // Show success message instead of redirecting
          setError(null);
          setIsLoading(false);
          // Display a success message specific to Gmail
          setError(
            "✅ Magic link sent! Check your email inbox for a sign-in link from Ishan Parihar. It may take a few minutes to arrive and might be in your Promotions or Updates folder.",
          );
          
          // Track login event (magic link)
          try {
            await trackLogin("magic-link");
          } catch (trackError) {
            console.error("[SignInForm] Error tracking login:", trackError);
          }
        }
      }
    } catch (error: any) {
      console.error("Sign-in failed:", error);
      setError(
        "Failed to sign in. Please check your credentials and try again.",
      );
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      // If a custom Google sign-in handler is provided, use it
      if (onGoogleSignIn) {
        console.log(
          "[SignInForm] Using custom Google sign-in handler from parent component",
        );
        onGoogleSignIn();
        return;
      }

      // Otherwise, use the default implementation
      console.log("[SignInForm] Using default Google sign-in implementation");
      console.log("[SignInForm] Using callbackUrl from props:", callbackUrl);

      // Clear auth cookies before sign-in to prevent conflicts
      const cookiesToClear = [
        "admin.session-token",
        "admin.callback-url",
        "admin.csrf-token",
        "user.session-token",
        "user.callback-url",
        "user.csrf-token",
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
        "adminAuthenticated",
        "adminEmail",
        "admin_session",
        "userAuthenticated",
        "userEmail",
        "userName",
        "userPicture",
        "userProvider",
        "userAuthToken",
        "better-auth.session_token",
      ];

      cookiesToClear.forEach((cookieName) => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

      // Set a debug cookie to track the sign-in attempt
      const timestamp = Date.now();
      document.cookie = `google_signin_attempt=${timestamp}; path=/; max-age=300; SameSite=Lax`;

      console.log(
        "[SignInForm] Starting Google sign-in with callback URL:",
        callbackUrl,
      );

      try {
        // Use NextAuth.js for Google authentication with redirect: false
        // This prevents the default redirect to NextAuth's signin page
        const result = await signIn("google", {
          callbackUrl: callbackUrl,
          redirect: false,
        });

        console.log("[SignInForm] Google signIn result:", result);

        // If there's an error, handle it
        if (result?.error) {
          console.error("[SignInForm] Google sign-in error:", result.error);
          setError(result.error);
          setIsGoogleLoading(false);
          return;
        }

        // If there's a URL, this means NextAuth wants us to redirect to Google's OAuth page
        if (result?.url) {
          // Check if the URL is a Google OAuth URL (contains accounts.google.com)
          if (result.url.includes("accounts.google.com")) {
            console.log(
              "[SignInForm] Redirecting to Google OAuth page:",
              result.url,
            );
            // Track Google login event
            try {
              await trackLogin("google");
            } catch (trackError) {
              console.error("[SignInForm] Error tracking login:", trackError);
            }
            // This will open the Google sign-in popup/page
            window.location.href = result.url;
            return;
          } else {
            // This is likely the callback URL after successful authentication
            console.log(
              "[SignInForm] Authentication successful, redirecting to:",
              result.url,
            );
            // Track Google login event
            try {
              await trackLogin("google");
            } catch (trackError) {
              console.error("[SignInForm] Error tracking login:", trackError);
            }
            window.location.href = result.url;
            return;
          }
        }

        // If we get here without a URL or error, something unexpected happened
        console.warn("[SignInForm] Unexpected result from signIn:", result);
        setError("An unexpected error occurred. Please try again.");
        setIsGoogleLoading(false);
      } catch (signInError: any) {
        console.error("[SignInForm] Error during signIn call:", signInError);
        setError(signInError.message || "Failed to initiate Google sign-in.");
        setIsGoogleLoading(false);
      }
    } catch (error: any) {
      console.error("[SignInForm] Google sign-in failed:", error);
      setError(error.message || "Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  // Render the form content only when in modal
  if (inModal) {
    return (
      <div className="py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-neutral-900 dark:text-white font-ui"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-neutral-900 dark:text-white font-ui"
            >
              Password{" "}
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                (optional for magic link)
              </span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (leave empty for magic link)"
            />
          </div>
          <div className="flex items-center justify-end">
            <Link
              href="/user/forgot-password"
              className="text-sm text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white font-ui"
            >
              Forgot password?
            </Link>
          </div>
          {error && (
            <div
              className={`text-sm p-3 rounded-none font-ui ${
                error.startsWith("✅")
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : "text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}
            >
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-300 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-black px-4 text-sm text-neutral-500 dark:text-neutral-400 font-ui">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
          />

          {onSwitchToSignUp && (
            <div className="text-center mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-ui">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSwitchToSignUp();
                  }}
                  className="text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-neutral-300 font-medium underline"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Render the full card for standalone page
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-3xl font-extrabold text-center dark:text-white">
          Sign In
        </CardTitle>
        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          Join our community for wisdom and self-actualization
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Password{" "}
              <span className="text-xs text-gray-500">
                (optional for magic link)
              </span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (leave empty for magic link)"
            />
          </div>
          <div className="flex items-center justify-end">
            <Link
              href="/user/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>
          {error && (
            <div
              className={`text-sm p-3 rounded-md ${
                error.startsWith("✅")
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : "text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}
            >
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            isLoading={isGoogleLoading}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-gray-200 dark:border-gray-800 pt-6">
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-none p-4 text-center">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sign-in Options
            </h3>
            <div className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-4 w-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2 text-left">
                  With password: Enter your email and password
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-4 w-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2 text-left">
                  Magic link: Enter only your email and we'll send you a sign-in
                  link
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="h-4 w-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="ml-2 text-left">
                  Google: Use your Google account for quick access
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              New user? Enter your email above and leave the password field
              empty to get started.
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
