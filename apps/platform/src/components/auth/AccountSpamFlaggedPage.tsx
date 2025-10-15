"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Flag,
  Mail,
  Shield,
  AlertTriangle,
  Home,
  HelpCircle,
  Calendar,
  User,
  TrendingUp,
  Eye,
} from "lucide-react";

export function AccountSpamFlaggedPage() {
  const searchParams = useSearchParams();
  const [flagDetails, setFlagDetails] = useState<{
    reason?: string;
    flaggedAt?: string;
    flaggedBy?: string;
    spamScore?: string;
  }>({});

  useEffect(() => {
    if (searchParams) {
      setFlagDetails({
        reason: searchParams.get("reason") || undefined,
        flaggedAt: searchParams.get("flagged_at") || undefined,
        flaggedBy: searchParams.get("flagged_by") || undefined,
        spamScore: searchParams.get("spam_score") || undefined,
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

  const getSpamScoreColor = (score?: string) => {
    if (!score) return "text-gray-500";
    const numScore = parseInt(score);
    if (numScore >= 80) return "text-red-600 dark:text-red-400";
    if (numScore >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  const getSpamScoreLabel = (score?: string) => {
    if (!score) return "Unknown";
    const numScore = parseInt(score);
    if (numScore >= 80) return "High Risk";
    if (numScore >= 60) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="min-h-screen bg-surface-background dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-none bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800">
                <Flag className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center">
                <Eye className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
            Account Under Review
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your account has been flagged for review due to suspicious activity
            patterns.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Flag className="h-5 w-5" />
              Review Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Alert */}
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <span className="font-medium">Account Flagged for Review</span>
                <span className="ml-2">
                  Some features may be limited while we verify your activity.
                </span>
              </AlertDescription>
            </Alert>

            {/* Flag Information */}
            <div className="grid gap-4">
              {flagDetails.reason && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <HelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Reason for Review
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {flagDetails.reason}
                    </p>
                  </div>
                </div>
              )}

              {flagDetails.spamScore && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <TrendingUp className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Risk Assessment
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${getSpamScoreColor(flagDetails.spamScore)}`}
                      >
                        {getSpamScoreLabel(flagDetails.spamScore)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        (Score: {flagDetails.spamScore}/100)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {flagDetails.flaggedAt && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Flagged On
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {formatDate(flagDetails.flaggedAt)}
                    </p>
                  </div>
                </div>
              )}

              {flagDetails.flaggedBy && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Reviewed By
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {flagDetails.flaggedBy}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Limitations */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Current Limitations
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Limited access to premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Restricted posting and commenting abilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>Enhanced monitoring of account activity</span>
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                How to resolve this?
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent mt-1">•</span>
                  <span>
                    Continue using your account normally and responsibly
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent mt-1">•</span>
                  <span>
                    Follow our community guidelines and terms of service
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent mt-1">•</span>
                  <span>
                    Contact support if you believe this flag is incorrect
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-accent mt-1">•</span>
                  <span>
                    Your account will be automatically reviewed within 7-14 days
                  </span>
                </li>
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
            <Link href="/account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Go to Account
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
            This review process helps maintain a safe and trustworthy community.{" "}
            <a
              href="mailto:support@ishanparihar.com"
              className="text-brand-accent hover:underline font-medium"
            >
              Contact us
            </a>{" "}
            if you have questions.
          </p>
        </div>
      </div>
    </div>
  );
}
