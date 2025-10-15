"use server";

import { createServiceRoleClient } from "@/utils/supabase/server";
import { z } from "zod";

// Schema for tracking events
const trackEventSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  metadata: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * Server action to track an analytics event
 * This can be called from server components or other server actions
 */
export async function trackEventAction(input: {
  eventName: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  userId?: string;
}) {
  try {
    // Validate input
    const validatedInput = trackEventSchema.parse(input);

    // Initialize Supabase client with service role to bypass RLS
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error("[AnalyticsAction] Failed to initialize Supabase service role client");
      return {
        success: false,
        message: "Failed to initialize database client",
      };
    }

    // Prepare the event data
    const eventData = {
      event_name: validatedInput.eventName,
      user_id: validatedInput.userId,
      session_id: validatedInput.sessionId,
      metadata: validatedInput.metadata,
    };

    // Insert the event into the database
    const { data, error } = await supabase
      .from("analytics_events")
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error("[AnalyticsAction] Error tracking event:", error);
      return {
        success: false,
        message: "Failed to track event",
      };
    }

    return {
      success: true,
      message: "Event tracked successfully",
      eventId: data.id,
    };
  } catch (error) {
    console.error("[AnalyticsAction] Exception tracking event:", error);
    return {
      success: false,
      message: "An unexpected error occurred while tracking the event",
    };
  }
}