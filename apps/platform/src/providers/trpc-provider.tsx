/**
 * tRPC Provider Component
 * This wraps the app with tRPC and React Query providers
 */

"use client";

import { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, trpcClientConfig } from "@/lib/trpc-client";

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 30 * 1000, // 30 seconds
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (
                error?.data?.httpStatus >= 400 &&
                error?.data?.httpStatus < 500
              ) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
          },
          mutations: {
          },
        },
      }),
  );

  const [trpcClient] = useState(() => api.createClient(trpcClientConfig));

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </api.Provider>
  );
}
