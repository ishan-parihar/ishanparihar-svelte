"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/trpc-client";

// Password validation schema
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ResetPasswordFormProps {
  token?: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Watch the password field for changes
  const password = watch("password");

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

  // Verify the token when the component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setError(
          "Missing reset token. Please request a new password reset link.",
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/users/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Invalid or expired token");
        }

        // Store the user's email
        if (result.email) {
          setUserEmail(result.email);
        }

        setIsValidToken(true);
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsValidToken(false);
        setError(
          error instanceof Error ? error.message : "Invalid or expired token",
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // tRPC mutation for reset password
  const resetPasswordMutation = api.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      setSubmitSuccess(true);
      // Redirect to sign in page after 3 seconds
      setTimeout(() => {
        router.push("/user/signin");
      }, 3000);
    },
    onError: (error) => {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password");
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (!token) {
      setError("Missing reset token");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 pb-4 flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </CardContent>
      </Card>
    );
  }

  if (!isValidToken) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-center">
              Invalid Reset Link
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400">
              {error ||
                "The password reset link is invalid or has expired. Please request a new one."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/user/forgot-password">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Request New Reset Link
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (submitSuccess) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-center">
              Password Reset Successful
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Your password has been successfully reset. You will be redirected
              to the sign in page shortly.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/user/signin">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-6 pb-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                readOnly
                disabled
                className="h-10 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
                aria-label="Your email address (cannot be changed)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your account email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                disabled={isSubmitting}
                className={
                  password
                    ? passwordStrength >= 3
                      ? "border-green-500 dark:border-green-500"
                      : passwordStrength >= 2
                        ? "border-yellow-500 dark:border-yellow-500"
                        : "border-red-500 dark:border-red-500"
                    : ""
                }
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
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
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {passwordStrength}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        passwordStrength === 5
                          ? "bg-green-500"
                          : passwordStrength >= 3
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {password && passwordStrength < 3 && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  <p>Password must include:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li
                      className={
                        password.length >= 8
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      At least 8 characters
                    </li>
                    <li
                      className={
                        /[a-z]/.test(password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Lowercase letters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Uppercase letters
                    </li>
                    <li
                      className={
                        /[0-9]/.test(password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Numbers
                    </li>
                    <li
                      className={
                        /[^a-zA-Z0-9]/.test(password)
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      Special characters
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
          <div className="text-center text-sm">
            <Link
              href="/user/signin"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Back to Sign In
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
