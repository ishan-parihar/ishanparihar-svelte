"use client";

import { useEffect } from "react";
import { api } from "@/lib/trpc-client";
import { useSessionStore } from "@/stores/sessionStore";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const setSession = useSessionStore((state) => state.setSession);

  // Fetch session data using tRPC
  const {
    data: sessionData,
    isLoading,
    error,
  } = api.user.getSession.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent excessive refetching
    retry: (failureCount, error: any) => {
      // Don't retry on client errors
      if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Update the Zustand store when session data changes
  useEffect(() => {
    if (error) {
      console.error("Session fetch error:", error);
      // Set error state
      setSession({
        isLoading: false,
        isLoggedIn: false,
        isPremium: false,
        user: null,
      });
      return;
    }

    if (!isLoading && sessionData) {
      setSession({
        isLoading: false,
        isLoggedIn: sessionData.isLoggedIn,
        isPremium: sessionData.isPremium,
        user: sessionData.user,
      });
    }
  }, [sessionData, isLoading, error, setSession]);

  return <>{children}</>;
}
