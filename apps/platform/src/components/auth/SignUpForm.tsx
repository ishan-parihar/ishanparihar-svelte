"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
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
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/trpc-client";

interface SignUpFormProps {
  inModal?: boolean;
  onSwitchToSignIn?: () => void;
  callbackUrl?: string;
}

export const SignUpForm = ({
  inModal = false,
  onSwitchToSignIn,
  callbackUrl = "/account",
}: SignUpFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const router = useRouter();

  // tRPC mutation for user registration
  const registerMutation = api.auth.register.useMutation({
    onSuccess: (data) => {
      // Handle successful registration
      console.log("Registration successful:", data);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      setError(error.message);
    },
  });

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Lowercase check
    if (/[a-z]/.test(password)) strength += 1;

    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 1;

    // Number check
    if (/[0-9]/.test(password)) strength += 1;

    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  // Check password match
  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    // Validate password strength
    if (passwordStrength < 3) {
      const errorMessage =
        "Password is too weak. It must include at least 8 characters, uppercase and lowercase letters, numbers, and special characters.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use tRPC mutation for user registration
      const data = await registerMutation.mutateAsync({
        email,
        password,
        name: email.split("@")[0], // Use email prefix as default name
        confirmPassword: confirmPassword,
      });

      // tRPC registration was successful, user needs to verify email
      if (data.requiresVerification) {
        // Show success message for email verification
        toast.success(
          "Account created successfully! Please check your email to verify your account.",
          {
            position: "top-center",
            duration: 5000,
          },
        );

        // Redirect to verification page if not in modal
        if (!inModal) {
          router.push(
            "/auth/verification-sent?email=" + encodeURIComponent(email),
          );
          return;
        } else {
          // In modal, show message and switch to sign in
          if (onSwitchToSignIn) {
            onSwitchToSignIn();
          }
          return;
        }
      }

      // For verified accounts (shouldn't happen for admin signup with email provider, but handle it)
      // Sign in the user automatically after successful sign-up
      const signInResult = await signIn("credentials", {
        email,
        password,
        callbackUrl: callbackUrl,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("Error signing in after signup:", signInResult.error);
        setError(
          "Account created but couldn't sign in automatically. Please try signing in manually.",
        );
        setIsLoading(false);
        return;
      }

      if (signInResult?.url) {
        // Redirect to the callback URL returned by signIn
        console.log(
          "Sign-in successful after signup, redirecting to:",
          signInResult.url,
        );
        window.location.href = signInResult.url;
        return;
      }

      // Fallback redirect if signIn doesn't return a URL
      console.log("Fallback redirect to:", callbackUrl);
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      console.error("Sign-up failed:", error);

      // Handle tRPC errors
      if (error.message.includes("User with this email already exists")) {
        setError(
          "An account with this email already exists. Please sign in instead.",
        );
      } else if (error.message.includes("Passwords don't match")) {
        setError(
          "Passwords don't match. Please check your password confirmation.",
        );
      } else {
        setError(error.message || "Failed to sign up. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render different UI based on whether we're in a modal or standalone page
  if (inModal) {
    return (
      <div className="py-4">
        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-neutral-900 dark:text-white font-ui"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className={`h-10 ${
                password
                  ? passwordStrength >= 3
                    ? "border-green-500 dark:border-green-500"
                    : passwordStrength >= 2
                      ? "border-yellow-500 dark:border-yellow-500"
                      : "border-red-500 dark:border-red-500"
                  : ""
              }`}
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-none border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-ui">
                    Password Strength:
                    <span
                      className={`ml-1 font-semibold ${
                        passwordStrength === 5
                          ? "text-green-600 dark:text-green-400"
                          : passwordStrength >= 3
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {passwordStrength === 0
                        ? "Very Weak"
                        : passwordStrength === 1
                          ? "Very Weak"
                          : passwordStrength === 2
                            ? "Weak"
                            : passwordStrength === 3
                              ? "Medium"
                              : passwordStrength === 4
                                ? "Strong"
                                : "Very Strong"}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 font-ui">
                    {passwordStrength}/5
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-none h-1.5 mb-3">
                  <div
                    className={`h-1.5 rounded-none ${
                      passwordStrength === 5
                        ? "bg-green-500"
                        : passwordStrength >= 3
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>

                {passwordStrength < 3 && (
                  <div className="text-xs text-neutral-700 dark:text-neutral-300 font-ui">
                    <p className="font-medium mb-1">Password must include:</p>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1 pl-1">
                      <li
                        className={`flex items-center ${password.length >= 8 ? "text-green-600 dark:text-green-400" : ""}`}
                      >
                        <svg
                          className={`h-3 w-3 mr-1 ${password.length >= 8 ? "text-green-500" : "text-gray-400"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {password.length >= 8 ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        8+ characters
                      </li>
                      <li
                        className={`flex items-center ${/[a-z]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}
                      >
                        <svg
                          className={`h-3 w-3 mr-1 ${/[a-z]/.test(password) ? "text-green-500" : "text-gray-400"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {/[a-z]/.test(password) ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        Lowercase
                      </li>
                      <li
                        className={`flex items-center ${/[A-Z]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}
                      >
                        <svg
                          className={`h-3 w-3 mr-1 ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {/[A-Z]/.test(password) ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        Uppercase
                      </li>
                      <li
                        className={`flex items-center ${/[0-9]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}
                      >
                        <svg
                          className={`h-3 w-3 mr-1 ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {/[0-9]/.test(password) ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        Numbers
                      </li>
                      <li
                        className={`flex items-center ${/[^a-zA-Z0-9]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}
                      >
                        <svg
                          className={`h-3 w-3 mr-1 ${/[^a-zA-Z0-9]/.test(password) ? "text-green-500" : "text-gray-400"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {/[^a-zA-Z0-9]/.test(password) ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        Special chars
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-neutral-900 dark:text-white font-ui"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className={`h-10 ${
                  confirmPassword
                    ? passwordMatch
                      ? "border-green-500 dark:border-green-500"
                      : passwordMatch === false
                        ? "border-red-500 dark:border-red-500"
                        : ""
                    : ""
                }`}
              />
              {passwordMatch && confirmPassword && (
                <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>

            {passwordMatch === false && confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center font-ui">
                <AlertCircle className="h-3 w-3 mr-1" />
                Passwords don't match
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm p-3 rounded-none bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start font-ui">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Add "Switch to Sign In" link when in modal */}
          {onSwitchToSignIn && (
            <div className="text-center mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-ui">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSwitchToSignIn();
                  }}
                  className="text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-neutral-300 font-medium underline"
                >
                  Sign In
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
          Admin Portal
        </CardTitle>
        <CardDescription className="text-center text-gray-600 dark:text-gray-400">
          Create a new admin account
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className={`h-10 ${
                password
                  ? passwordStrength >= 3
                    ? "border-green-500 dark:border-green-500"
                    : passwordStrength >= 2
                      ? "border-yellow-500 dark:border-yellow-500"
                      : "border-red-500 dark:border-red-500"
                  : ""
              }`}
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                {/* Password strength indicator content */}
                {/* This content is already in the original component */}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                className={`h-10 ${
                  confirmPassword
                    ? passwordMatch
                      ? "border-green-500 dark:border-green-500"
                      : passwordMatch === false
                        ? "border-red-500 dark:border-red-500"
                        : ""
                    : ""
                }`}
              />
              {passwordMatch && confirmPassword && (
                <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>

            {passwordMatch === false && confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Passwords don't match
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col border-t border-gray-200 dark:border-gray-800 pt-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-none p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-amber-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Admin Access Information
            </h3>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            This portal is restricted to authorized personnel only. Your email
            address must be on the approved list to create an admin account.
          </p>
          <div className="mt-3 text-xs text-amber-600 dark:text-amber-500">
            <p>For assistance, please contact the system administrator.</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
