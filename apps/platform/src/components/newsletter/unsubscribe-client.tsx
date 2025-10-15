"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc-client";

interface UnsubscribeClientProps {
  initialSuccess?: boolean;
  initialMessage?: string;
}

export function UnsubscribeClient({
  initialSuccess,
  initialMessage,
}: UnsubscribeClientProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | undefined>(initialSuccess);
  const [message, setMessage] = useState(initialMessage || "");
  const router = useRouter();

  // tRPC mutations and utils
  const utils = api.useUtils();
  const unsubscribeMutation = api.newsletter.unsubscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(undefined);
    setMessage("");

    try {
      // Check if the email exists and get the unsubscribe token using tRPC
      const emailCheckResult = await utils.newsletter.checkEmail.fetch({
        email,
      });

      if (!emailCheckResult.exists) {
        setSuccess(false);
        setMessage("This email is not subscribed to our newsletter");
        return;
      }

      if (!emailCheckResult.subscribed) {
        setSuccess(true);
        setMessage("You are already unsubscribed from our newsletter");
        return;
      }

      // If the email exists and is active, unsubscribe using the token
      if (emailCheckResult.token) {
        const unsubscribeResult = await unsubscribeMutation.mutateAsync({
          token: emailCheckResult.token,
        });

        setSuccess(unsubscribeResult.success);
        setMessage(unsubscribeResult.message);

        if (unsubscribeResult.success) {
          setEmail("");
        }
      } else {
        setSuccess(false);
        setMessage("Unable to process unsubscribe request. Please try again.");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {success === undefined ? (
        <>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-full">
              <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center mb-4">
            Unsubscribe from Newsletter
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            Please enter your email address to unsubscribe from our newsletter.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoHome}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? "Processing..." : "Unsubscribe"}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div
              className={`${
                success
                  ? "bg-green-50 dark:bg-green-900/30"
                  : "bg-red-50 dark:bg-red-900/30"
              } p-3 rounded-full`}
            >
              {success ? (
                <CheckCircle2
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  strokeWidth={1.5}
                />
              ) : (
                <AlertCircle
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  strokeWidth={1.5}
                />
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">
            {success ? "Unsubscribed Successfully" : "Unsubscribe Failed"}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>

          <div className="flex justify-center">
            <Button onClick={handleGoHome}>Return to Homepage</Button>
          </div>
        </div>
      )}
    </div>
  );
}
