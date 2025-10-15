"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
// DISABLED: Import for cookie migration to prevent conflicts with Auth.js
// import CookieMigrationHelper from "@/components/auth/CookieMigrationHelper";

interface Props {
  children: ReactNode;
  session?: any;
}

export default function SessionProviderWrapper({ children, session }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Reduced logging to prevent console spam
    if (process.env.NODE_ENV === "development") {
      console.log("[SessionProviderWrapper] Component mounted");
    }
  }, []); // Remove session dependency to prevent unnecessary re-renders

  // Always render the SessionProvider to ensure useSession hook works properly
  // The mounting state is handled within UserAuthProvider instead
  return (
    <SessionProvider
      session={session}
      refetchInterval={0} // Disable automatic refetching to prevent loops
      refetchOnWindowFocus={false} // Disable refetch on focus to prevent excessive calls
      refetchWhenOffline={false} // Don't refetch when offline
      basePath="/api/auth" // Explicitly set the base path for Auth.js API routes
    >
      {/* DISABLED: CookieMigrationHelper to prevent conflicts with Auth.js */}
      {/* Cookie migration has been disabled to allow Auth.js to manage its own cookies */}
      <UserAuthProvider mounted={mounted}>{children}</UserAuthProvider>
    </SessionProvider>
  );
}
