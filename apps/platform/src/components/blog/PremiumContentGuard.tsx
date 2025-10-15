"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Crown, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  userQueryKeys,
  getUserPremiumStatus,
  UserPremiumStatus,
  useUserPremiumStatusWithHelpers,
  transformUserPremiumData,
  UserPremiumData,
} from "@/queries/userQueries";
import { createClient } from "@/utils/supabase/client";
import { AnimatedSection } from "@/components/motion";

interface PremiumContentGuardProps {
  children: React.ReactNode;
  isPremium: boolean;
  postTitle?: string;
  postSlug?: string;
  contentType?: "full-page" | "content-only"; // New prop to control what gets protected
}

// Remove the old interface since we're using the one from userQueries

export function PremiumContentGuard({
  children,
  isPremium,
  postTitle = "this content",
  postSlug = "",
  contentType = "content-only",
}: PremiumContentGuardProps) {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;
  const userId = session?.user?.id;

  // Create Supabase client for queries
  const supabase = createClient();

  // Use Supabase Cache Helpers hook for premium status
  const {
    data: premiumDataRaw,
    isLoading,
    error,
    isError,
  } = useUserPremiumStatusWithHelpers(
    supabase,
    userId || "",
    isPremium && status === "authenticated" && !!userId,
  );

  // Transform the raw data to match legacy format for backward compatibility
  const premiumData = premiumDataRaw
    ? transformUserPremiumData(premiumDataRaw)
    : null;

  // Determine the current premium status
  const getPremiumStatus = () => {
    // If content is not premium, allow access
    if (!isPremium) {
      return {
        hasPremium: true,
        isLoading: false,
        error: null,
      };
    }

    // If user is not authenticated, no premium access
    if (status === "unauthenticated") {
      return {
        hasPremium: false,
        isLoading: false,
        error: null,
      };
    }

    // If session is still loading, show loading state
    if (status === "loading") {
      return {
        hasPremium: false,
        isLoading: true,
        error: null,
      };
    }

    // If no user email, can't check premium status
    if (!userEmail) {
      return {
        hasPremium: false,
        isLoading: false,
        error: "Unable to verify user identity.",
      };
    }

    // If React Query is loading
    if (isLoading) {
      return {
        hasPremium: false,
        isLoading: true,
        error: null,
      };
    }

    // If there was an error
    if (isError || !premiumData?.success) {
      return {
        hasPremium: false,
        isLoading: false,
        error:
          premiumData?.error ||
          "Unable to verify premium status. Please upgrade to premium to access this content.",
      };
    }

    // Success case
    return {
      hasPremium: premiumData.hasPremium,
      isLoading: false,
      error: null,
    };
  };

  const premiumStatus = getPremiumStatus();

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && premiumData && userEmail) {
      console.log(
        `[PremiumContentGuard] User ${premiumData.user?.email} premium status:`,
        {
          has_active_membership: premiumData.user?.has_active_membership,
          role: premiumData.user?.role,
          hasPremium: premiumData.hasPremium,
        },
      );
    }
  }, [premiumData, userEmail]);

  // Show loading state
  if (premiumStatus.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Verifying access...</span>
      </div>
    );
  }

  // Show error state
  if (premiumStatus.error) {
    return (
      <AnimatedSection>
        <Card className="max-w-md mx-auto my-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {premiumStatus.error}
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/pricing">Upgrade to Premium</Link>
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    );
  }

  // If content is not premium or user has premium access, show content
  if (!isPremium || premiumStatus.hasPremium) {
    return <>{children}</>;
  }

  // Show premium upgrade prompt for authenticated users without premium
  if (status === "authenticated") {
    const upgradePrompt = (
      <AnimatedSection>
        <Card
          className={
            contentType === "content-only" ? "my-8" : "max-w-md mx-auto my-8"
          }
        >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Premium Content
          </CardTitle>
          <CardDescription>
            {contentType === "content-only"
              ? "The full content of this article is available to premium members only."
              : "This content is available to premium members only."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {contentType === "content-only"
              ? `Unlock the full article "${postTitle}" and all premium content with a premium membership.`
              : `Unlock access to ${postTitle} and all premium content with a premium membership.`}
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/pricing">Upgrade to Premium</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/blog">Browse Free Content</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </AnimatedSection>
    );

    return upgradePrompt;
  }

  // Show sign-in prompt for unauthenticated users
  return (
    <AnimatedSection>
      <Card className="max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Sign In Required
        </CardTitle>
        <CardDescription>
          Please sign in to access this premium content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This content requires a premium membership. Sign in to check your
          access or upgrade your account.
        </p>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/blog">Browse Free Content</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
    </AnimatedSection>
  );
}
