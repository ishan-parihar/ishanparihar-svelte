"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, RefreshCw, Mail, Download, Loader2 } from "lucide-react";
import { ProfileImageManager } from "./ProfileImageManager";
import { UpdatePasswordForm } from "./UpdatePasswordForm";
import { UpdateNameForm } from "./UpdateNameForm";
import { BookmarksTabContent } from "./BookmarksTabContent";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AnimatedSection, StaggeredList } from "@/components/motion";
import { useSession } from "next-auth/react";
import { CustomerSupportWidget } from "@/components/customer/support/customer-support-widget";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { userQueryKeys, isEffectivelySubscribed } from "@/queries/userQueries";
import { api } from "@/lib/trpc-client";

// Type definition for order data from payments.getOrders
type OrderItem = {
  id: string;
  created_at: string;
  order_number: string;
  total_amount: number;
  status: string;
  currency: string;
  customer_email: string;
  customer_name: string | null;
  service: {
    id: string;
    name: string;
    slug: string;
  } | null;
  payments: Array<{
    id: string;
    status: string;
    amount: number;
  }>;
};

// Helper function to determine if a user is subscribed to the newsletter
const isSubscribed = (user: any) => {
  if (!user) return false;

  // Simple boolean conversion for both fields
  // NextAuth JWT and session should now always provide proper boolean values
  const newsletter_subscribed = !!user.newsletter_subscribed;
  const manually_unsubscribed = !!user.manually_unsubscribed;

  // A user is subscribed if newsletter_subscribed is true AND manually_unsubscribed is false
  const isActuallySubscribed = newsletter_subscribed && !manually_unsubscribed;

  // Log the values for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("isSubscribed result:", {
      newsletter_subscribed,
      manually_unsubscribed,
      isActuallySubscribed,
    });
  }

  return isActuallySubscribed;
};

// Helper function to download PDF from Base64 string
const downloadPdfFromBase64 = (base64String: string, filename: string) => {
  try {
    // Convert Base64 to Blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    // Create object URL and download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw new Error("Failed to download PDF");
  }
};

export const UserAccountDashboard = () => {
  const { user, isLoading, signOut, updateUserData } = useUserAuth();
  const { data: session, update: updateSession, status } = useSession();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingNewsletter, setUpdatingNewsletter] = useState(false);
  const initialRenderComplete = React.useRef(false);
  const [lastSessionUpdate, setLastSessionUpdate] = useState<number>(
    Date.now(),
  );
  // Create a local state for user data that we can update directly
  const [localUser, setUser] = useState(user);

  // Pagination state for orders
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Create Supabase client for queries
  const supabase = createClient();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  // Use tRPC for newsletter status
  const {
    data: newsletterStatusData,
    isLoading: newsletterStatusLoading,
    error: newsletterStatusError,
    refetch: refetchNewsletterStatus,
  } = api.user.getNewsletterStatus.useQuery(undefined, {
    enabled: status === "authenticated" && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Use tRPC for orders with pagination
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = api.payments.getOrders.useQuery(
    {
      page: currentPage,
      limit: ordersPerPage,
    },
    {
      enabled: status === "authenticated" && !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  );

  // Debug logging for newsletter status
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Newsletter Status Debug:", {
        newsletterStatusData,
        newsletterStatusLoading,
        newsletterStatusError:
          newsletterStatusError?.message || newsletterStatusError,
        userId,
        userEmail,
        status,
        session: session?.user,
        enabled: status === "authenticated" && !!userId,
      });

      if (newsletterStatusError) {
        console.error(
          "Newsletter Status Error Details:",
          newsletterStatusError,
        );
      }
    }
  }, [
    newsletterStatusData,
    newsletterStatusLoading,
    newsletterStatusError,
    userId,
    userEmail,
    status,
    session,
  ]);

  // tRPC mutation for updating newsletter status
  const updateNewsletterMutation = api.user.updateNewsletterStatus.useMutation({
    onSuccess: () => {
      // Refetch newsletter status to update UI
      refetchNewsletterStatus();
    },
  });

  // tRPC mutation for generating invoice
  const generateInvoiceMutation = api.user.generateInvoice.useMutation({
    onSuccess: (data) => {
      // Handle PDF download
      downloadPdfFromBase64(data.pdf, data.filename);
      toast.success("Invoice downloaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to generate invoice: ${error.message}`);
    },
  });

  // Initialize active tab from localStorage if available, otherwise default to "dashboard"
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("userDashboardActiveTab");
      return savedTab || "dashboard";
    }
    return "dashboard";
  });

  // Flag to track if we've fetched the newsletter status
  const hasInitiallyFetchedNewsletter = useRef(false);

  // Create a ref to track the last time we fetched newsletter status
  const lastNewsletterFetchTime = useRef<number>(0);

  // Store session data in refs to avoid unnecessary re-renders
  const sessionRef = useRef(session);
  const prevSessionRef = useRef(session);

  // Flag to track if we're currently updating from the API
  const isUpdatingFromApi = useRef(false);

  // Function to refresh user data - wrapped in useCallback to prevent recreation on each render
  const handleRefreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      // First, check if we need to refresh the NextAuth session
      // Only refresh if it's been more than 10 seconds since the last update
      // This prevents unnecessary refreshes that can cause infinite loops
      const timeSinceLastUpdate = Date.now() - lastSessionUpdate;
      if (timeSinceLastUpdate > 10000) {
        // 10 seconds
        try {
          await updateSession();
          setLastSessionUpdate(Date.now());
        } catch (sessionError) {
          console.error("Error refreshing NextAuth session:", sessionError);
        }
      }

      const success = await updateUserData();
      if (success) {
        // If user data is available, update the local state
        if (user) {
          // Explicitly convert to boolean values
          const newsletter_subscribed =
            typeof user.newsletter_subscribed === "boolean"
              ? user.newsletter_subscribed
              : !!user.newsletter_subscribed;
          const manually_unsubscribed =
            typeof user.manually_unsubscribed === "boolean"
              ? user.manually_unsubscribed
              : !!user.manually_unsubscribed;

          // Force update the local user state with the correct boolean values
          setUser((prevUser) => {
            if (!prevUser) return prevUser;

            // Create updated user with correct boolean values
            const updatedUser = {
              ...prevUser,
              // Always use the session name if available (most up-to-date source)
              name: session?.user?.name || prevUser.name,
              newsletter_subscribed,
              manually_unsubscribed,
            };

            return updatedUser;
          });
        }

        return true;
      } else {
        console.error("Failed to refresh user data");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [updateUserData, user, session, updateSession, lastSessionUpdate]);

  // Function to format date with fallback
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Function to format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
    }
  };

  // Function to format status badge
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "refunded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Function to handle newsletter subscription toggle
  const handleNewsletterToggle = async () => {
    if (!userId || !newsletterStatusData) return;

    // Set the flag to indicate we're updating from the API
    isUpdatingFromApi.current = true;

    // Use the API data to determine current subscription status
    const isCurrentlySubscribed = newsletterStatusData.subscribed;

    const toastId = toast.loading(
      isCurrentlySubscribed
        ? "Unsubscribing from newsletter..."
        : "Subscribing to newsletter...",
    );

    setUpdatingNewsletter(true);

    try {
      // We want to toggle the current subscription status
      const newSubscriptionStatus = !isCurrentlySubscribed;

      // Use tRPC mutation instead of REST API
      const result = await updateNewsletterMutation.mutateAsync({
        subscribed: newSubscriptionStatus,
      });

      // Ensure we stay on the settings tab before showing the success toast
      goToSettingsTab();

      // Show success toast with the new subscription status
      toast.success(
        newSubscriptionStatus
          ? "Successfully subscribed to newsletter"
          : "Successfully unsubscribed from newsletter",
        { id: toastId },
      );

      if (process.env.NODE_ENV === "development") {
        console.log(
          "Successfully updated newsletter subscription via API",
          result,
        );
      }

      // Invalidate and refetch the newsletter status data to update the UI immediately
      await refetchNewsletterStatus();

      // Also trigger a session update to ensure NextAuth session reflects the changes
      if (updateSession) {
        await updateSession();
      }
    } catch (error) {
      console.error("Error updating newsletter subscription:", error);
      toast.error(
        `Failed to update newsletter subscription: ${error instanceof Error ? error.message : "Unknown error"}`,
        { id: toastId },
      );
    } finally {
      setUpdatingNewsletter(false);

      // Reset the flag after a delay to ensure the state update has completed
      setTimeout(() => {
        isUpdatingFromApi.current = false;
      }, 1000);
    }
  };

  // Clear local storage when component mounts (only once)
  useEffect(() => {
    // Skip on server-side render
    if (typeof window === "undefined") return;

    // Only run once on client
    if (!initialRenderComplete.current) {
      // Clear all legacy localStorage items
      const localStorageKeys = [
        "userAuthenticated",
        "userEmail",
        "userName",
        "userPicture",
        "userProvider",
        "userAuthToken",
        "userRole",
        "userHasPassword",
        "userId",
        "userCustomPicture",
        "userNewsletterSubscribed",
        "userIsActive",
        "userSubscribedAt",
        "userUnsubscribeToken",
        "userLastLogin",
        "userLoginCount",
        "userPreferences",
        "userEmailVerified",
        "userCreatedAt",
        "userUpdatedAt",
        "user",
        "userData",
        "auth",
        "authToken",
        "session",
        "newsletter_status",
      ];

      localStorageKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Also try to clear any items that might start with 'user' or 'auth'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("user") || key.startsWith("auth"))) {
          localStorage.removeItem(key);
        }
      }

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith("user") || key.startsWith("auth"))) {
          sessionStorage.removeItem(key);
        }
      }
    }
  }, []);

  // State for newsletter status refresh
  const [refreshingNewsletter, setRefreshingNewsletter] = useState(false);

  // Function to refresh newsletter status using tRPC
  const fetchNewsletterStatus = useCallback(
    async (silent = false) => {
      if (!userId) return;

      // Check if we've fetched recently (within the last 3 seconds)
      const now = Date.now();
      const timeSinceLastFetch = now - lastNewsletterFetchTime.current;
      if (timeSinceLastFetch < 3000 && silent) {
        // 3 seconds debounce for silent calls
        if (process.env.NODE_ENV === "development") {
          console.log(
            `Skipping newsletter fetch - last fetch was ${timeSinceLastFetch}ms ago`,
          );
        }
        return;
      }

      // Update the last fetch time
      lastNewsletterFetchTime.current = now;

      // Set the flag to indicate we're updating from the API
      isUpdatingFromApi.current = true;

      setRefreshingNewsletter(true);

      // Only show toast if not in silent mode
      const toastId = silent
        ? null
        : toast.loading("Refreshing newsletter status...");

      if (process.env.NODE_ENV === "development") {
        console.log("Refreshing newsletter status using tRPC");
      }

      try {
        // Use the tRPC refetch function
        const result = await refetchNewsletterStatus();

        if (result.data) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "Successfully refreshed newsletter status:",
              result.data,
            );
          }

          // Show success toast (if not in silent mode)
          if (toastId) {
            const isSubscribedStatus = result.data.subscribed;
            toast.success(
              `Newsletter status: ${isSubscribedStatus ? "Subscribed" : "Not subscribed"}`,
              { id: toastId },
            );
          }
        } else if (toastId) {
          toast.success("Newsletter status refreshed", { id: toastId });
        }
      } catch (error) {
        console.error("Error fetching newsletter status:", error);
        if (toastId) {
          toast.error(
            `Error refreshing newsletter status: ${error instanceof Error ? error.message : "Unknown error"}`,
            { id: toastId },
          );
        }
      } finally {
        setRefreshingNewsletter(false);

        // Reset the flag after a delay to ensure the state update has completed
        setTimeout(() => {
          isUpdatingFromApi.current = false;
        }, 1000);
      }
    },
    [userId, refetchNewsletterStatus],
  );

  // Fetch newsletter status as soon as user data is available
  useEffect(() => {
    // Skip if session is not available yet
    if (!session) {
      console.log(
        "Session is not available yet, skipping initial newsletter fetch",
      );
      return;
    }

    // Skip if we've already fetched or if there's no user data
    if (hasInitiallyFetchedNewsletter.current || !localUser?.id) return;

    // Mark as fetched immediately to prevent multiple executions
    hasInitiallyFetchedNewsletter.current = true;
    console.log(
      "First time with user data, scheduling newsletter status fetch",
    );

    // Use a longer timeout to ensure the session is fully established
    const timer = setTimeout(() => {
      // Only fetch if we're not already updating
      if (!isUpdatingFromApi.current) {
        // Check if we've fetched recently (within the last 5 seconds)
        const now = Date.now();
        const timeSinceLastFetch = now - lastNewsletterFetchTime.current;
        if (timeSinceLastFetch < 5000) {
          // 5 seconds debounce
          console.log(
            `Skipping initial newsletter fetch - last fetch was ${timeSinceLastFetch}ms ago`,
          );
          return;
        }

        console.log("Executing initial newsletter status fetch");
        fetchNewsletterStatus(true).catch((error) => {
          console.error("Error in initial newsletter status fetch:", error);
        });
      } else {
        console.log(
          "Skipping initial newsletter fetch as an update is already in progress",
        );
      }
    }, 2500); // Increased timeout to 2.5 seconds

    return () => clearTimeout(timer);
  }, [localUser?.id, fetchNewsletterStatus, status, session]); // Include session in dependencies

  // This ref is already declared above

  // Add an additional effect to fetch newsletter status on component mount
  useEffect(() => {
    // Skip if session is not available yet
    if (!session) {
      console.log(
        "Session is not available yet, skipping component mount newsletter fetch",
      );
      return;
    }

    // Skip if there's no user data
    if (!localUser?.id) return;

    // Skip if we're already updating from the API
    if (isUpdatingFromApi.current) {
      console.log(
        "Skipping newsletter fetch as an update is already in progress",
      );
      return;
    }

    // Skip if we've fetched recently (within the last 5 seconds)
    const now = Date.now();
    const timeSinceLastFetch = now - lastNewsletterFetchTime.current;
    if (timeSinceLastFetch < 5000) {
      // 5 seconds debounce
      console.log(
        `Skipping newsletter fetch - last fetch was ${timeSinceLastFetch}ms ago`,
      );
      return;
    }

    // Update the last fetch time
    lastNewsletterFetchTime.current = now;

    console.log("Fetching newsletter status on component mount");

    // Fetch newsletter status silently (true parameter means silent mode)
    fetchNewsletterStatus(true).catch(() => {
      // Silently handle errors
    });
  }, [localUser?.id, fetchNewsletterStatus, status, session]); // Include session in dependencies

  // Function to fetch initial data with priority on newsletter status
  const fetchInitialData = useCallback(async () => {
    try {
      // First, directly fetch the newsletter status to ensure it's correct
      // Use silent mode to avoid showing toast notifications during initial load
      await fetchNewsletterStatus(true);

      // Only do a general refresh if it's been more than 5 seconds since the last update
      // This prevents unnecessary refreshes that can cause infinite loops
      const timeSinceLastUpdate = Date.now() - lastSessionUpdate;
      if (timeSinceLastUpdate > 5000) {
        // 5 seconds
        await handleRefreshData();
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  }, [fetchNewsletterStatus, handleRefreshData, lastSessionUpdate]);

  // Separate useEffect for data refresh to avoid infinite loops
  useEffect(() => {
    // Skip on server-side render
    if (typeof window === "undefined") return;

    // Skip if session is not available yet
    if (!session) {
      console.log("Session is not available yet, skipping initial data fetch");
      return;
    }

    // Only refresh data once when loading is complete and user is available
    if (!isLoading && user && !initialRenderComplete.current) {
      // Mark as complete immediately to prevent multiple executions
      initialRenderComplete.current = true;
      console.log("Initial render complete, scheduling data fetch");

      // Use a longer timeout to ensure the session is fully established
      const timer = setTimeout(() => {
        // Only fetch if we're not already updating
        if (!isUpdatingFromApi.current) {
          console.log("Executing initial data fetch");
          fetchInitialData();
        } else {
          console.log(
            "Skipping initial data fetch as an update is already in progress",
          );
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, fetchInitialData, status, session]); // Include session in dependencies

  // We don't need a periodic session refresh as it causes refresh loops
  // The session will be updated when needed through user actions

  // This ref is already declared above

  // Function to set active tab to settings - can be passed to child components
  // Using useCallback to prevent unnecessary re-renders
  const goToSettingsTab = useCallback(() => {
    // Only update if the current tab is not already "settings"
    if (activeTab !== "settings") {
      setActiveTab("settings");
    }
  }, [activeTab, setActiveTab]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userDashboardActiveTab", activeTab);
    }
  }, [activeTab]);

  // Keep local user state in sync with user from context and NextAuth session
  useEffect(() => {
    // Skip if we're currently updating from the API
    if (isUpdatingFromApi.current) {
      return;
    }

    // Skip if there's no user data
    if (!user) {
      return;
    }

    // Use a stable JSON representation for comparison
    const userJson = JSON.stringify(user);
    const localUserJson = JSON.stringify(localUser);

    // Only update if the user object has actually changed
    // This prevents unnecessary re-renders
    if (userJson !== localUserJson) {
      console.log("User context changed, updating local state");

      // Create a new user object with explicitly converted boolean values
      // This ensures the values are properly typed for the isSubscribed function
      const updatedUser = {
        ...user,
        // ALWAYS use session name if available (most up-to-date source)
        name: session?.user?.name || user.name,
        // Get newsletter status from session if available, otherwise from user context
        newsletter_subscribed:
          (session?.user as any)?.newsletter_subscribed !== undefined
            ? !!(session?.user as any)?.newsletter_subscribed
            : typeof user.newsletter_subscribed === "boolean"
              ? user.newsletter_subscribed
              : user.newsletter_subscribed === true ||
                user.newsletter_subscribed === "true" ||
                user.newsletter_subscribed === 1 ||
                user.newsletter_subscribed === "1",
        manually_unsubscribed:
          (session?.user as any)?.manually_unsubscribed !== undefined
            ? !!(session?.user as any)?.manually_unsubscribed
            : typeof user.manually_unsubscribed === "boolean"
              ? user.manually_unsubscribed
              : user.manually_unsubscribed === true ||
                user.manually_unsubscribed === "true" ||
                user.manually_unsubscribed === 1 ||
                user.manually_unsubscribed === "1",
      };

      // Log the name sources for debugging
      if (session?.user?.name !== user.name) {
        console.log("Name from session differs from context:", {
          sessionName: session?.user?.name,
          contextName: user.name,
          usingName: updatedUser.name,
        });
      }

      // Use a ref to track if we're updating from this effect
      const prevIsUpdating = isUpdatingFromApi.current;
      isUpdatingFromApi.current = true;

      // Update the local user state
      setUser(updatedUser);

      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingFromApi.current = prevIsUpdating;
      }, 100);
    }
  }, [user, session?.user, localUser, setUser]);

  // Add a specific effect to update the user data when the session changes
  useEffect(() => {
    // Skip if session is not available yet
    if (!session) {
      console.log(
        "Session is not available yet, skipping session-based update",
      );
      return;
    }

    // Skip if we're currently updating from the API
    if (isUpdatingFromApi.current) {
      return;
    }

    // Skip if there's no session or local user data
    if (!session?.user || !localUser) {
      return;
    }

    // Skip if we've updated recently (within the last 2 seconds)
    const now = Date.now();
    const timeSinceLastUpdate = now - lastSessionUpdate;
    if (timeSinceLastUpdate < 2000) {
      // 2 seconds debounce
      console.log(
        `Skipping session-based update - last update was ${timeSinceLastUpdate}ms ago`,
      );
      return;
    }

    // Update the session ref with the current session
    sessionRef.current = session;

    // Only proceed if the session has actually changed
    if (sessionRef.current === prevSessionRef.current) {
      return;
    }

    // Update the previous session ref
    prevSessionRef.current = sessionRef.current;

    // Check if any relevant session data has changed
    const sessionName = session.user.name;
    const sessionNewsletterSubscribed = (session.user as any)
      ?.newsletter_subscribed;
    const sessionManuallyUnsubscribed = (session.user as any)
      ?.manually_unsubscribed;

    // Convert to proper boolean values for comparison
    const boolSessionNewsletterSubscribed =
      sessionNewsletterSubscribed !== undefined
        ? !!sessionNewsletterSubscribed
        : undefined;
    const boolSessionManuallyUnsubscribed =
      sessionManuallyUnsubscribed !== undefined
        ? !!sessionManuallyUnsubscribed
        : undefined;
    const boolLocalNewsletterSubscribed =
      localUser.newsletter_subscribed !== undefined
        ? !!localUser.newsletter_subscribed
        : undefined;
    const boolLocalManuallyUnsubscribed =
      localUser.manually_unsubscribed !== undefined
        ? !!localUser.manually_unsubscribed
        : undefined;

    const nameChanged = sessionName && sessionName !== localUser.name;
    const newsletterChanged =
      boolSessionNewsletterSubscribed !== undefined &&
      boolSessionNewsletterSubscribed !== boolLocalNewsletterSubscribed;
    const unsubscribedChanged =
      boolSessionManuallyUnsubscribed !== undefined &&
      boolSessionManuallyUnsubscribed !== boolLocalManuallyUnsubscribed;

    const needsUpdate = nameChanged || newsletterChanged || unsubscribedChanged;

    if (needsUpdate) {
      console.log("Session data changed, updating local user:", {
        nameChanged,
        newsletterChanged,
        unsubscribedChanged,
        currentName: localUser.name,
        sessionName: sessionName,
        sessionNewsletterSubscribed: boolSessionNewsletterSubscribed,
        localNewsletterSubscribed: boolLocalNewsletterSubscribed,
        sessionManuallyUnsubscribed: boolSessionManuallyUnsubscribed,
        localManuallyUnsubscribed: boolLocalManuallyUnsubscribed,
      });

      // Set the updating flag to prevent loops
      const prevIsUpdating = isUpdatingFromApi.current;
      isUpdatingFromApi.current = true;

      // Use a functional update to ensure we're working with the latest state
      setUser((prevUser) => {
        if (!prevUser) return prevUser;

        // Only update the fields that have actually changed
        const updatedUser = { ...prevUser };

        if (nameChanged) {
          updatedUser.name = sessionName;
        }

        if (newsletterChanged) {
          updatedUser.newsletter_subscribed = boolSessionNewsletterSubscribed;
        }

        if (unsubscribedChanged) {
          updatedUser.manually_unsubscribed = boolSessionManuallyUnsubscribed;
        }

        return updatedUser;
      });

      // Update the last session update time
      setLastSessionUpdate(now);

      // Reset the flag after a longer delay to ensure the state update has completed
      setTimeout(() => {
        isUpdatingFromApi.current = prevIsUpdating;
      }, 500); // Increased to 500ms
    }
  }, [session, localUser, setUser, lastSessionUpdate, status]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!localUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="bg-transparent p-4 sm:p-6 rounded-none border border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-heading text-foreground mb-2">
            Welcome to Your Digital Hub
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed font-body">
            Explore your personalized dashboard to manage your digital
            purchases, track your downloads, and access exclusive content.
            <span className="hidden sm:inline">
              {" "}
              Need help? Our support team is just a click away.
            </span>
          </p>
        </div>
      </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-transparent rounded-none">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-transparent"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:bg-transparent"
          >
            My Purchases
          </TabsTrigger>
          <TabsTrigger
            value="bookmarks"
            className="data-[state=active]:bg-transparent"
          >
            My Bookmarks
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="data-[state=active]:bg-transparent"
          >
            Support
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-transparent"
          >
            Account Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Recent Purchases
                </CardTitle>
                <CardDescription className="text-neutral-500 dark:text-neutral-400">
                  View your recent purchases and downloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  You haven't made any purchases yet.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full rounded-none border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  Browse Products
                </Button>
              </CardFooter>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
              <CardHeader>
                <CardTitle className="text-foreground">Support</CardTitle>
                <CardDescription className="text-neutral-500 dark:text-neutral-400">
                  Get help with your account or purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Need help? Contact our support team.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full rounded-none border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  onClick={() => setActiveTab("support")}
                >
                  Go to Support
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="purchases" className="mt-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">
                Purchase History
              </CardTitle>
              <CardDescription className="text-neutral-500 dark:text-neutral-400">
                View your past purchases and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Loading orders...
                  </div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : ordersError ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="rounded-none bg-red-100 dark:bg-red-900 p-3 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-center text-red-600 dark:text-red-400 mb-4">
                    Failed to load orders
                  </p>
                  <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-4">
                    {ordersError.message ||
                      "An error occurred while fetching your orders."}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => refetchOrders()}
                    className="rounded-none"
                  >
                    Try Again
                  </Button>
                </div>
              ) : !ordersData?.orders || ordersData.orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="rounded-none bg-neutral-100 dark:bg-neutral-900 p-3 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-neutral-400 dark:text-neutral-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-center text-neutral-500 dark:text-neutral-400 mb-4">
                    You haven't made any purchases yet.
                  </p>
                  <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 max-w-md">
                    Browse our products and find digital assets that will help
                    you in your projects.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.orders.map((order: OrderItem) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {order.service?.name || "Service"}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                                Order #{order.order_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(order.total_amount, order.currency)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                generateInvoiceMutation.mutate({
                                  orderId: order.id,
                                })
                              }
                              disabled={generateInvoiceMutation.isPending}
                              className="flex items-center gap-2"
                            >
                              {generateInvoiceMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {ordersData && ordersData.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {/* Page numbers */}
                          {Array.from(
                            { length: Math.min(5, ordersData.totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (ordersData.totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (
                                currentPage >=
                                ordersData.totalPages - 2
                              ) {
                                pageNum = ordersData.totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(pageNum)}
                                    isActive={pageNum === currentPage}
                                    className="cursor-pointer"
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            },
                          )}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(ordersData.totalPages, prev + 1),
                                )
                              }
                              className={
                                currentPage === ordersData.totalPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            {!ordersLoading &&
              !ordersError &&
              (!ordersData?.orders || ordersData.orders.length === 0) && (
                <CardFooter className="flex justify-center border-t border-neutral-200 dark:border-neutral-800">
                  <Button className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none">
                    Browse Products
                  </Button>
                </CardFooter>
              )}
          </Card>
        </TabsContent>
        <TabsContent value="bookmarks" className="mt-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">My Bookmarks</CardTitle>
              <CardDescription className="text-neutral-500 dark:text-neutral-400">
                View and manage your saved articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookmarksTabContent />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="support" className="mt-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">
                Customer Support
              </CardTitle>
              <CardDescription className="text-neutral-500 dark:text-neutral-400">
                Get help with your account, purchases, or any questions you may
                have
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerSupportWidget />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none shadow-none">
            <CardHeader>
              <CardTitle className="text-foreground">
                Account Settings
              </CardTitle>
              <CardDescription className="text-neutral-500 dark:text-neutral-400">
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-transparent p-6 rounded-none border border-neutral-200 dark:border-neutral-800">
                      <h3 className="text-lg font-subheading mb-2 text-foreground">
                        Profile Information
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 font-ui">
                        Update your account profile information.
                      </p>
                      <div className="space-y-4">
                        <UpdateNameForm maintainTab={goToSettingsTab} />
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            disabled
                            value={localUser.email}
                            className="w-full p-2 border rounded-none bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Only show profile picture manager for non-Google accounts */}
                    {localUser.provider !== "google" && (
                      <div className="bg-transparent p-6 rounded-none border border-neutral-200 dark:border-neutral-800">
                        <ProfileImageManager maintainTab={goToSettingsTab} />
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Only show password settings for non-Google accounts */}
                    {localUser.provider !== "google" ? (
                      <div className="bg-transparent p-6 rounded-none border border-neutral-200 dark:border-neutral-800">
                        <UpdatePasswordForm maintainTab={goToSettingsTab} />
                      </div>
                    ) : (
                      <div className="bg-transparent p-6 rounded-none border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-lg font-subheading mb-2 text-foreground">
                          Google Account
                        </h3>
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="bg-neutral-100 dark:bg-neutral-900 p-2 rounded-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-neutral-600 dark:text-neutral-400"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4"></path>
                              <path d="M12 8h.01"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                              You're signed in with Google. Your profile picture
                              and password are managed through your Google
                              account.
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                              To change your profile picture or password, please
                              visit your{" "}
                              <a
                                href="https://myaccount.google.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-600 dark:text-neutral-400 hover:underline"
                              >
                                Google Account settings
                              </a>
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-transparent p-6 rounded-none border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <h3 className="text-lg font-subheading mb-2 text-foreground">
                          Content Preferences
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 font-ui">
                          Manage your followed topics and content preferences.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Followed Topics
                            </span>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Customize your content feed by following topics
                              that interest you
                            </p>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-none"
                          >
                            <Link href="/account/topics">Manage Topics</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-transparent p-6 rounded-none border border-neutral-200 dark:border-neutral-800">
                      <div>
                        <h3 className="text-lg font-subheading mb-2 text-foreground">
                          Newsletter Preferences
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 font-ui">
                          Manage your newsletter subscription.
                        </p>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Newsletter Subscription
                          </span>
                        </div>
                        {/* Check session status before rendering newsletter UI */}
                        {!session ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-5 w-24 rounded-none"></div>
                            <div className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-5 w-10 rounded-none"></div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 px-2 py-0.5 rounded-none">
                              {(() => {
                                // Get newsletter status from cache helper data first, then session, then local user
                                let subscribed = false;
                                let dataSource = "none";

                                if (newsletterStatusData) {
                                  // Use API data (most up-to-date)
                                  subscribed =
                                    !!newsletterStatusData.subscribed;
                                  dataSource = "tRPC";

                                  // Debug logging
                                  if (process.env.NODE_ENV === "development") {
                                    console.log(
                                      "Newsletter UI Debug - Using tRPC data:",
                                      {
                                        newsletterStatusData,
                                        subscribed,
                                        dataSource,
                                      },
                                    );
                                  }
                                } else {
                                  // Fall back to session data
                                  const sessionUser = session?.user as any;
                                  const newsletter_subscribed =
                                    sessionUser?.newsletter_subscribed;
                                  const manually_unsubscribed =
                                    sessionUser?.manually_unsubscribed;

                                  subscribed = sessionUser
                                    ? !!newsletter_subscribed &&
                                      !manually_unsubscribed
                                    : isSubscribed(localUser);
                                  dataSource = sessionUser
                                    ? "session"
                                    : "local";

                                  // Debug logging
                                  if (process.env.NODE_ENV === "development") {
                                    console.log(
                                      "Newsletter UI Debug - Using fallback data:",
                                      {
                                        sessionUser,
                                        newsletter_subscribed,
                                        manually_unsubscribed,
                                        subscribed,
                                        dataSource,
                                        localUser,
                                      },
                                    );
                                  }
                                }

                                // Use a more visible status indicator
                                return (
                                  <span
                                    className={`font-medium ${subscribed ? "text-black dark:text-white" : "text-black dark:text-white"}`}
                                  >
                                    {subscribed
                                      ? "Subscribed"
                                      : "Not subscribed"}{" "}
                                    ({dataSource})
                                  </span>
                                );
                              })()}
                            </span>
                            <Switch
                              checked={(() => {
                                // Get newsletter status from cache helper data first, then session, then local user
                                if (newsletterStatusData) {
                                  // Use API data (most up-to-date)
                                  const checked =
                                    !!newsletterStatusData.subscribed;
                                  if (process.env.NODE_ENV === "development") {
                                    console.log(
                                      "Newsletter Switch Debug - Using tRPC data:",
                                      {
                                        newsletterStatusData,
                                        checked,
                                      },
                                    );
                                  }
                                  return checked;
                                } else {
                                  // Fall back to session data
                                  const sessionUser = session?.user as any;
                                  const newsletter_subscribed =
                                    sessionUser?.newsletter_subscribed;
                                  const manually_unsubscribed =
                                    sessionUser?.manually_unsubscribed;

                                  const checked = sessionUser
                                    ? !!newsletter_subscribed &&
                                      !manually_unsubscribed
                                    : isSubscribed(localUser);

                                  if (process.env.NODE_ENV === "development") {
                                    console.log(
                                      "Newsletter Switch Debug - Using fallback data:",
                                      {
                                        sessionUser,
                                        newsletter_subscribed,
                                        manually_unsubscribed,
                                        checked,
                                      },
                                    );
                                  }
                                  return checked;
                                }
                              })()}
                              onCheckedChange={handleNewsletterToggle}
                              disabled={
                                updatingNewsletter ||
                                refreshingNewsletter ||
                                newsletterStatusLoading ||
                                !session
                              }
                              aria-label="Toggle newsletter subscription"
                            />
                          </div>
                        )}
                      </div>

                      {!session ? (
                        <div className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-4 w-full max-w-md rounded-none mt-4"></div>
                      ) : (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                          {(() => {
                            // Get newsletter status from cache helper data first, then session, then local user
                            let subscribed = false;

                            if (newsletterStatusData) {
                              // Use API data (most up-to-date)
                              subscribed = !!newsletterStatusData.subscribed;
                            } else {
                              // Fall back to session data
                              const sessionUser = session?.user as any;
                              const newsletter_subscribed =
                                sessionUser?.newsletter_subscribed;
                              const manually_unsubscribed =
                                sessionUser?.manually_unsubscribed;

                              subscribed = sessionUser
                                ? !!newsletter_subscribed &&
                                  !manually_unsubscribed
                                : isSubscribed(localUser);
                            }

                            return subscribed
                              ? "You are currently subscribed to our newsletter. You'll receive updates about new products, features, and promotions."
                              : "Subscribe to our newsletter to receive updates about new products, features, and promotions.";
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        {/* Admin Dashboard Link - Only visible to admin users */}
        {localUser.role === "admin" && (
          <Button
            variant="default"
            onClick={() => (window.location.href = "/admin")}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Go to Admin Dashboard
          </Button>
        )}

        <Button
          variant="outline"
          onClick={signOut}
          className="flex items-center gap-2 dark:border-neutral-700 dark:hover:bg-neutral-800 rounded-none"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
      </AnimatedSection>
    </div>
  );
};
