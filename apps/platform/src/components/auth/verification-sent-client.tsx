"use client";

import Link from "next/link";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface VerificationSentClientProps {
  email: string | undefined;
}

export function VerificationSentClient({ email }: VerificationSentClientProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({
    type: null,
    text: "",
  });
  const [cooldown, setCooldown] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  // Show toast notifications when message changes
  useEffect(() => {
    if (message.type === "success") {
      toast.success(message.text);
    } else if (message.type === "error") {
      toast.error(message.text);
    }
  }, [message]);

  // Handle cooldown timer
  useEffect(() => {
    // Skip the cooldown on initial load
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    // Start cooldown timer when resend is successful
    if (message.type === "success") {
      setCooldown(60); // 60 seconds cooldown
    }

    // Set up the interval to count down
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prevCooldown) => {
          if (prevCooldown <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prevCooldown - 1;
        });
      }, 1000);

      // Clean up the interval
      return () => clearInterval(interval);
    }
  }, [message.type, cooldown, initialLoad]);

  // Function to handle resending verification email
  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    setMessage({ type: null, text: "" });

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to resend verification email",
        );
      }

      // Set success message
      setMessage({
        type: "success",
        text: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error) {
      console.error("Error resending verification email:", error);

      // Set error message
      setMessage({
        type: "error",
        text: `Failed to resend verification email: ${error instanceof Error ? error.message : "Please try again."}`,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] lg:min-h-[calc(100vh-70px)] flex items-center justify-center w-full bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-none shadow-md p-8 text-center">
        <div className="mb-6">
          <Mail className="h-16 w-16 mx-auto text-blue-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Verification Email Sent
        </h1>

        {message.type === "success" && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md">
            {message.text}
          </div>
        )}

        {message.type === "error" && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md">
            {message.text}
          </div>
        )}

        <div className="text-slate-600 dark:text-slate-300 mb-8">
          <p className="mb-2">We've sent a verification email to:</p>
          {email && (
            <p className="font-medium text-black dark:text-white mb-4">
              {email}
            </p>
          )}
          <p className="mt-4">
            Please check your inbox and click the verification link to complete
            your account setup. You'll be automatically subscribed to our
            newsletter, but you can unsubscribe at any time.
          </p>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            If you don't see the email, please check your spam folder.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={isResending || cooldown > 0}
            className="flex items-center justify-center"
          >
            {isResending ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              <>
                <span className="h-4 w-4 mr-2 flex items-center justify-center text-xs font-semibold">
                  {cooldown}
                </span>
                Resend in {cooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>

          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
