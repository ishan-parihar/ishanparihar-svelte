"use client";

import React, { useEffect, useState } from "react";
import { getFeaturedOfferingsByPathAction } from "@/app/actions/pathOfferingsActions";
import IntegratedPathsSection from "@/components/sections/IntegratedPathsSection";
import { PathOffering } from "@/queries/pathOfferingsQueriesServer";

export function IntegratedPathsSectionClient() {
  const [offerings, setOfferings] = useState<PathOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfferings() {
      try {
        setLoading(true);
        console.log("[IntegratedPathsSectionClient] Fetching offerings...");
        const data = await getFeaturedOfferingsByPathAction();
        console.log("[IntegratedPathsSectionClient] Received data:", data);
        // Filter out any offerings that don't have a path
        const validOfferings = data.filter(offering => offering.path !== null);
        console.log("[IntegratedPathsSectionClient] Valid offerings:", validOfferings);
        setOfferings(validOfferings);
      } catch (err) {
        console.error("[IntegratedPathsSectionClient] Error fetching offerings:", err);
        setError("Failed to load offerings. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchOfferings();
  }, []);

  if (loading) {
    return (
      <div className="h-96 animate-pulse bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Loading content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  console.log("[IntegratedPathsSectionClient] Rendering with offerings:", offerings);

  return <IntegratedPathsSection offerings={offerings} />;
}