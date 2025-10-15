// Enable Incremental Static Regeneration (ISR) with 30-minute revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { createServiceRoleClient } from "@/utils/supabase/server";
import {
  prefetchPublicServices,
  prefetchFeaturedServices,
  prefetchServiceCategories,
} from "@/queries/servicesQueries";
import { ServicesPageClient } from "@/components/services-page-client";
import { Metadata } from "next";
import { trackPageView } from "@/lib/analytics/server";

export const metadata: Metadata = {
  title: "Offerings | Ishan Parihar",
  description:
    "Discover our range of programs, memberships, and premium services designed to support your transformative journey.",
};

export default async function OfferingsPage() {
  const queryClient = new QueryClient();

  try {
    const supabase = createServiceRoleClient();

    if (!supabase) {
      console.error("[OfferingsPage] Failed to create Supabase client");
      return (
        <main className="min-h-screen bg-background">
          <ServicesPageClient />
        </main>
      );
    }

    await Promise.allSettled([
      prefetchPublicServices(queryClient, supabase),
      prefetchFeaturedServices(queryClient, supabase, 6),
      prefetchServiceCategories(queryClient, supabase),
    ]);
  } catch (error) {
    console.error("[OfferingsPage] Error during prefetching:", error);
  }

  // Track page view on the server side
  try {
    await trackPageView("Offerings Page", "/offerings");
  } catch (error) {
    console.error("[OfferingsPage] Error tracking page view:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="min-h-screen bg-background">
        <ServicesPageClient />
      </main>
    </HydrationBoundary>
  );
}
