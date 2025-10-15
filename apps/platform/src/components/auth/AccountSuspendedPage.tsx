"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShieldX,
  Mail,
  Clock,
  AlertTriangle,
  Home,
  HelpCircle,
  Calendar,
  User,
} from "lucide-react";

export function AccountSuspendedPage() {
  const searchParams = useSearchParams();
  const [suspensionDetails, setSuspensionDetails] = useState<{
    reason?: string;
    expiresAt?: string;
    suspendedBy?: string;
    suspendedAt?: string;
  }>({});

  useEffect(() => {
    if (searchParams) {
      setSuspensionDetails({
        reason: searchParams.get("reason") || undefined,
        expiresAt: searchParams.get("expires_at") || undefined,
        suspendedBy: searchParams.get("suspended_by") || undefined,
        suspendedAt: searchParams.get("suspended_at") || undefined,
      });
    }
  }, [searchParams]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const isTemporary =
    suspensionDetails.expiresAt &&
    new Date(suspensionDetails.expiresAt) > new Date();

  return (
    <div className="min-h-screen bg-surface-background dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-none bg-red-100 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800">
                <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
            Account Suspended
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your account access has been temporarily restricted. Please review
            the details below.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="mb-8 border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <ShieldX className="h-5 w-5" />
              Suspension Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Suspension Status Alert */}
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <span className="font-medium">
                  {isTemporary ? "Temporary Suspension" : "Account Suspended"}
                </span>
                {isTemporary && (
                  <span className="ml-2">
                    Your account will be automatically restored on{" "}
                    {formatDate(suspensionDetails.expiresAt)}.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            {/* Suspension Information */}
            <div className="grid gap-4">
              {suspensionDetails.reason && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <HelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Reason
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {suspensionDetails.reason}
                    </p>
                  </div>
                </div>
              )}

              {suspensionDetails.suspendedAt && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Suspended On
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {formatDate(suspensionDetails.suspendedAt)}
                    </p>
                  </div>
                </div>
              )}

              {suspensionDetails.expiresAt && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {isTemporary ? "Expires On" : "Expired On"}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {formatDate(suspensionDetails.expiresAt)}
                    </p>
                  </div>
                </div>
              )}

              {suspensionDetails.suspendedBy && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Suspended By
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {suspensionDetails.suspendedBy}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                What can you do?
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent mt-1">•</span>
                  <span>
                    Contact our support team if you believe this is an error
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent mt-1">•</span>
                  <span>
                    Review our community guidelines and terms of service
                  </span>
                </li>
                {isTemporary && (
                  <li className="flex items-start gap-2">
                    <span className="text-brand-accent mt-1">•</span>
                    <span>Wait for the suspension to expire automatically</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-brand-accent hover:bg-brand-accent-hover text-white"
          >
            <Link href="/contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="border-gray-300 dark:border-gray-600"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need immediate assistance? Email us at{" "}
            <a
              href="mailto:support@ishanparihar.com"
              className="text-brand-accent hover:underline font-medium"
            >
              support@ishanparihar.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
