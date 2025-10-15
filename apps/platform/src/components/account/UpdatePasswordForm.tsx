"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Password validation schema - removed currentPassword requirement
const passwordSchema = z
  .object({
    newPassword: z
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
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface UpdatePasswordFormProps {
  maintainTab?: () => void;
}

export function UpdatePasswordForm({ maintainTab }: UpdatePasswordFormProps) {
  const { user, updateUserData } = useUserAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange", // Validate on change for real-time feedback
  });

  // Watch password fields for real-time validation
  const newPassword = useWatch({ control, name: "newPassword" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });

  // Check password match in real-time
  useEffect(() => {
    if (newPassword && confirmPassword) {
      setPasswordMatch(newPassword === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [newPassword, confirmPassword]);

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    // Length check
    if (newPassword.length >= 8) strength += 1;

    // Lowercase check
    if (/[a-z]/.test(newPassword)) strength += 1;

    // Uppercase check
    if (/[A-Z]/.test(newPassword)) strength += 1;

    // Number check
    if (/[0-9]/.test(newPassword)) strength += 1;

    // Special character check
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  }, [newPassword]);

  const onSubmit = async (data: PasswordFormData) => {
    if (!user) {
      toast.error("You must be logged in to update your password");
      return;
    }

    // Clear any previous messages
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/users/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({
          newPassword: data.newPassword,
        }),
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update password");
      }

      // Set success message in the component
      setSuccessMessage("Password updated successfully!");
      setErrorMessage(null);

      // Show a prominent toast notification
      toast.success("Password updated successfully", {
        duration: 5000, // Show for 5 seconds
        position: "top-center",
        style: {
          backgroundColor: "#10B981",
          color: "white",
          fontSize: "16px",
          padding: "16px",
        },
      });

      // Update the user data in the context
      const success = await updateUserData({
        hasPassword: true,
      });

      if (!success) {
        console.warn(
          "Failed to update user data in context, but password was updated successfully",
        );
      }

      // Set success message in the component
      setSuccessMessage(
        isGoogleUser
          ? "Password set successfully! You can now sign in with your email and password."
          : "Your password has been updated successfully.",
      );

      // Reset the form
      reset();

      // Scroll to the success message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);

      // If maintainTab function is provided, call it to ensure we stay on the settings tab
      if (maintainTab) {
        maintainTab();
      }
    } catch (error) {
      console.error("Error updating password:", error);

      // Set error message in the component
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update password";
      setErrorMessage(errorMsg);

      // Show a prominent toast notification
      toast.error(errorMsg, {
        duration: 5000, // Show for 5 seconds
        position: "top-center",
        style: {
          backgroundColor: "#EF4444",
          color: "white",
          fontSize: "16px",
          padding: "16px",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user signed in with Google and doesn't have a password yet
  const isGoogleUser = user?.provider === "google" && !user?.hasPassword;

  return (
    <div>
      <h3 className="text-lg font-medium mb-2 text-primary dark:text-primary-foreground">
        Password Settings
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {isGoogleUser
          ? "Set a password to enable email sign-in for your account."
          : "Update your account password. No current password required."}
      </p>

      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-400 ml-2">
            Success
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 ml-6">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-400 ml-2">
            Error
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300 ml-6">
            {errorMessage}
          </AlertDescription>
          <button
            onClick={() => setErrorMessage(null)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label
            htmlFor="newPassword"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {isGoogleUser ? "Password" : "New Password"}
          </Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword")}
            className={`mt-1 w-full dark:bg-gray-800 dark:border-gray-700 ${
              errors.newPassword ? "border-red-500 dark:border-red-500" : ""
            }`}
          />

          {/* Password Strength Indicator */}
          {newPassword && (
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

          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className={`mt-1 w-full dark:bg-gray-800 dark:border-gray-700 ${
                errors.confirmPassword
                  ? "border-red-500 dark:border-red-500"
                  : passwordMatch === true
                    ? "border-green-500 dark:border-green-500"
                    : passwordMatch === false
                      ? "border-red-500 dark:border-red-500"
                      : ""
              }`}
            />
            {passwordMatch === true && confirmPassword && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>

          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}

          {!errors.confirmPassword &&
            passwordMatch === false &&
            confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
                Passwords don't match
              </p>
            )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || passwordMatch === false}
          className="mt-4 w-full"
        >
          {isLoading
            ? "Updating..."
            : isGoogleUser
              ? "Set Password"
              : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
