/**
 * Centralized Analytics Utility
 * This module provides a consistent interface for tracking events throughout the application
 */

"use client";

import { api } from "@/lib/trpc-client";

// Type definitions
interface TrackEventParams {
  eventName: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

/**
 * Track an analytics event using the tRPC mutation
 * @param params - Event parameters
 */
export async function trackEvent({ eventName, metadata, sessionId }: TrackEventParams) {
  try {
    // Use tRPC mutation for event tracking
    const mutation = api.analytics.trackEvent.useMutation();
    await mutation.mutateAsync({
      eventName,
      metadata,
      sessionId,
    });
  } catch (error) {
    // Log error but don't throw to avoid disrupting user experience
    console.error("[Analytics] Error tracking event:", error);
  }
}

/**
 * Track a page view event
 * @param pageName - Name of the page
 * @param pagePath - Path of the page
 */
export async function trackPageView(pageName: string, pagePath: string) {
  await trackEvent({
    eventName: "Page Viewed",
    metadata: {
      pageName,
      pagePath,
    },
  });
}

/**
 * Track a user login event
 * @param method - Login method (e.g., "credentials", "google")
 */
export async function trackLogin(method: string) {
  await trackEvent({
    eventName: "User Logged In",
    metadata: {
      method,
    },
  });
}

/**
 * Track a CTA click event
 * @param ctaName - Name of the CTA
 * @param location - Location of the CTA (e.g., "Hero Section", "Footer")
 */
export async function trackCtaClick(ctaName: string, location: string) {
  await trackEvent({
    eventName: "Clicked CTA",
    metadata: {
      ctaName,
      location,
    },
  });
}

/**
 * Track an offering view event
 * @param offeringSlug - Slug of the offering
 * @param offeringTitle - Title of the offering
 */
export async function trackOfferingView(offeringSlug: string, offeringTitle: string) {
  await trackEvent({
    eventName: "Viewed Offering",
    metadata: {
      offeringSlug,
      offeringTitle,
    },
  });
}

/**
 * Track a newsletter subscription event
 * @param email - Email address (hashed for privacy)
 */
export async function trackNewsletterSubscription(email: string) {
  await trackEvent({
    eventName: "Newsletter Subscribed",
    metadata: {
      // Note: In a real implementation, we would hash the email for privacy
      // For now, we'll just indicate that a subscription occurred
    },
  });
}

/**
 * Track an initiated checkout event
 * @param offeringId - ID of the offering being purchased
 * @param offeringTitle - Title of the offering being purchased
 */
export async function trackInitiatedCheckout(offeringId: string, offeringTitle: string) {
  await trackEvent({
    eventName: "Initiated Checkout",
    metadata: {
      offeringId,
      offeringTitle,
    },
  });
}

/**
 * Track a completed sale event
 * @param offeringId - ID of the offering that was purchased
 * @param offeringTitle - Title of the offering that was purchased
 * @param amount - Amount of the sale
 * @param currency - Currency of the sale
 * @param orderId - Order ID of the sale
 */
export async function trackCompletedSale(
  offeringId: string,
  offeringTitle: string,
  amount: number,
  currency: string,
  orderId: string
) {
  await trackEvent({
    eventName: "Completed Sale",
    metadata: {
      offeringId,
      offeringTitle,
      amount,
      currency,
      orderId,
    },
  });
}