"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/trpc-client";

// Email validation schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  // Watch the email field
  const emailValue = watch("email");

  // tRPC mutation for forgot password
  const forgotPasswordMutation = api.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      // Store the email that was submitted
      setSubmittedEmail(emailValue);
      setSubmitSuccess(true);
    },
    onError: (error) => {
      console.error("Error sending reset email:", error);
      setError(error.message || "Failed to send reset email");
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await forgotPasswordMutation.mutateAsync({ email: data.email });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-center">
              Check Your Email
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md w-full">
              <p className="text-center text-blue-700 dark:text-blue-300 font-medium">
                {submittedEmail}
              </p>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              If an account exists with the email you provided, we've sent
              instructions to reset your password.
            </p>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-2">
              <strong>Note:</strong> If you normally sign in with Google, this
              will allow you to set up a password for your account.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/user/signin">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your email address below and we'll send you a link to reset
              your password.
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                Google users: This will allow you to set up a password for your
                account.
              </span>
            </p>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
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
            {isSubmitting ? "Sending..." : "Send Reset Link"}
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
