"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserAuthProvider, useUserAuth } from "@/contexts/UserAuthContext";
import { UserAccountHeader } from "@/components/account/UserAccountHeader";
import { UserAccountDashboard } from "@/components/account/UserAccountDashboard";

function AccountContent() {
  const { user, isLoading } = useUserAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple authentication check - no profile completion logic needed
  useEffect(() => {
    console.log(
      "AccountPage useEffect running. Status:",
      status,
      "Mounted:",
      mounted,
    );

    if (mounted && status === "authenticated" && session?.user) {
      console.log(
        "AccountPage useEffect - User authenticated:",
        session.user.email,
      );
    } else if (status !== "loading") {
      console.log(
        "AccountPage useEffect - Status not authenticated or no user.",
      );
    }
  }, [mounted, session, status]);

  // Check if the user is authenticated
  useEffect(() => {
    // Only redirect after client-side hydration and when loading is complete
    if (mounted && !isLoading && !user) {
      console.log("User not authenticated, redirecting to sign in");

      // Use a longer delay to allow for auth state to be restored from cookies
      // This prevents unnecessary redirects during page refreshes and gives more time for session to be established
      const redirectTimer = setTimeout(() => {
        // Double-check if the user is still not authenticated before redirecting
        if (!user) {
          console.log(
            "Still not authenticated after delay, redirecting to sign-in page",
          );

          // Since we're already using useSession() and useUserAuth(),
          // we don't need to make additional API calls to check session status
          // The NextAuth.js session management handles this automatically
          router.push("/user/signin?redirect=/account");
        }
      }, 1500); // Increased from 500ms to 1500ms

      return () => clearTimeout(redirectTimer);
    }
  }, [user, isLoading, mounted, router]);

  // Show loading spinner during loading or if not authenticated
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-transparent rounded-none shadow-sm border dark:border-gray-800 p-4 sm:p-6 mb-8">
        <div className="flex flex-row justify-between items-center gap-2 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">
            My Account
          </h1>
          <UserAccountHeader />
        </div>
      </div>
      <UserAccountDashboard />
    </div>
  );
}

export default function AccountPage() {
  return (
    <UserAuthProvider>
      <AccountContent />
    </UserAuthProvider>
  );
}
