/**
 * Server-side Analytics Utility
 * This module provides a server-side interface for tracking events
 */

import { trackEventAction } from "@/app/actions/analytics";

// Type definitions
interface TrackEventParams {
  eventName: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  userId?: string;
}

/**
 * Track an analytics event using the server action
 * @param params - Event parameters
 */
export async function trackEvent({ eventName, metadata, sessionId, userId }: TrackEventParams) {
  try {
    // Use server action for event tracking
    await trackEventAction({
      eventName,
      metadata,
      sessionId,
      userId,
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