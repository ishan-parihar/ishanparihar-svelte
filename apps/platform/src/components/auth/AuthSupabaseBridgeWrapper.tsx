"use client";

import dynamic from "next/dynamic";

// Dynamically import the SupabaseSessionSynchronizer component to ensure it's only loaded on the client
const SupabaseSessionSynchronizer = dynamic(
  () => import("@/components/auth/SupabaseSessionSynchronizer"),
  { ssr: false },
);

/**
 * Client component wrapper for SupabaseSessionSynchronizer
 * This allows us to use dynamic import with ssr: false in a client component
 *
 * This wrapper maintains backward compatibility with the existing layout structure
 * while providing the new optimized auth state synchronization.
 */
export default function AuthSupabaseBridgeWrapper() {
  return <SupabaseSessionSynchronizer />;
}
