/**
 * Analytics tRPC Router
 * Handles analytics event tracking and dashboard data
 */

import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/lib/trpc";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// Schema for tracking events
const trackEventSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  metadata: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
});

// Schema for date range
const dateRangeSchema = z.object({
  days: z.number().min(1).max(365).default(30),
});

export const analyticsRouter = createTRPCRouter({
  // Track an analytics event
  trackEvent: publicProcedure
    .input(trackEventSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Prepare the event data
        const eventData = {
          event_name: input.eventName,
          user_id: ctx.user?.id,
          session_id: input.sessionId,
          metadata: input.metadata,
        };

        // Insert the event into the database
        const { data, error } = await ctx.supabase
          .from("analytics_events")
          .insert(eventData)
          .select()
          .single();

        if (error) {
          console.error("Error tracking event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to track event",
            cause: error,
          });
        }

        return {
          success: true,
          message: "Event tracked successfully",
          eventId: data.id,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Unexpected error tracking event:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while tracking the event",
        });
      }
    }),

  // Get total events count (admin only)
  getTotalEvents: adminProcedure.query(async ({ ctx }) => {
    try {
      const { count, error } = await ctx.supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching total events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch total events",
          cause: error,
        });
      }

      return {
        count: count || 0,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      console.error("Unexpected error fetching total events:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while fetching total events",
      });
    }
  }),

  // Get unique visitors count (admin only)
  getUniqueVisitors: adminProcedure.query(async ({ ctx }) => {
    try {
      // Fetch all events with session_id
      const { data, error } = await ctx.supabase
        .from("analytics_events")
        .select("session_id")
        .neq("session_id", null)
        .not("session_id", "is", null);

      if (error) {
        console.error("Error fetching session data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch session data",
          cause: error,
        });
      }

      // Count distinct session IDs
      const uniqueSessionIds = new Set(
        data.map((event) => event.session_id).filter(Boolean)
      );
      
      return {
        count: uniqueSessionIds.size,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      console.error("Unexpected error fetching unique visitors:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while fetching unique visitors",
      });
    }
  }),

  // Get top events (admin only)
  getTopEvents: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ ctx, input }) => {
      try {
        const { limit } = input;
        
        // Fetch recent events
        const { data, error } = await ctx.supabase
          .from("analytics_events")
          .select("event_name")
          .order("created_at", { ascending: false })
          .limit(limit * 2); // Fetch more events to ensure we have enough for grouping

        if (error) {
          console.error("Error fetching events for top events:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch events",
            cause: error,
          });
        }

        // Group events by name and count them
        const eventCounts: Record<string, number> = {};
        data.forEach((event) => {
          eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
        });

        // Convert to array and sort by count
        const topEvents = Object.entries(eventCounts)
          .map(([event_name, count]) => ({ event_name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);

        return {
          events: topEvents,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Unexpected error fetching top events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching top events",
        });
      }
    }),

  // Get conversion funnel data (admin only)
  getConversionFunnel: adminProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { days } = input;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        
        // Get count for each funnel step within the date range
        const { data: viewedOfferingData, error: viewedOfferingError } = await ctx.supabase
          .from("analytics_events")
          .select("id")
          .eq("event_name", "Viewed Offering")
          .gte("created_at", fromDate.toISOString());

        if (viewedOfferingError) {
          console.error("Error fetching viewed offering events:", viewedOfferingError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch viewed offering events",
            cause: viewedOfferingError,
          });
        }

        const { data: initiatedCheckoutData, error: initiatedCheckoutError } = await ctx.supabase
          .from("analytics_events")
          .select("id")
          .eq("event_name", "Initiated Checkout")
          .gte("created_at", fromDate.toISOString());

        if (initiatedCheckoutError) {
          console.error("Error fetching initiated checkout events:", initiatedCheckoutError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch initiated checkout events",
            cause: initiatedCheckoutError,
          });
        }

        const { data: completedSaleData, error: completedSaleError } = await ctx.supabase
          .from("analytics_events")
          .select("id")
          .eq("event_name", "Completed Sale")
          .gte("created_at", fromDate.toISOString());

        if (completedSaleError) {
          console.error("Error fetching completed sale events:", completedSaleError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch completed sale events",
            cause: completedSaleError,
          });
        }

        return {
          viewedOffering: viewedOfferingData.length,
          initiatedCheckout: initiatedCheckoutData.length,
          completedSale: completedSaleData.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Unexpected error fetching conversion funnel:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching conversion funnel data",
        });
      }
    }),

  // Get offering performance data (admin only)
  getOfferingPerformance: adminProcedure
    .input(dateRangeSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { days } = input;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        
        // Get all "Viewed Offering" events
        const { data: viewedEvents, error: viewedError } = await ctx.supabase
          .from("analytics_events")
          .select("metadata")
          .eq("event_name", "Viewed Offering")
          .gte("created_at", fromDate.toISOString());

        if (viewedError) {
          console.error("Error fetching viewed offering events:", viewedError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch viewed offering events",
            cause: viewedError,
          });
        }

        // Get all "Completed Sale" events
        const { data: saleEvents, error: saleError } = await ctx.supabase
          .from("analytics_events")
          .select("metadata")
          .eq("event_name", "Completed Sale")
          .gte("created_at", fromDate.toISOString());

        if (saleError) {
          console.error("Error fetching completed sale events:", saleError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch completed sale events",
            cause: saleError,
          });
        }

        // Process viewed events to count views per offering
        const viewCounts: Record<string, { title: string; count: number }> = {};
        viewedEvents.forEach(event => {
          if (event.metadata && event.metadata.offeringId) {
            const offeringId = event.metadata.offeringId;
            const offeringTitle = event.metadata.offeringTitle || "Unknown Offering";
            
            if (!viewCounts[offeringId]) {
              viewCounts[offeringId] = { title: offeringTitle, count: 0 };
            }
            viewCounts[offeringId].count++;
          }
        });

        // Process sale events to count sales per offering
        const saleCounts: Record<string, number> = {};
        saleEvents.forEach(event => {
          if (event.metadata && event.metadata.offeringId) {
            const offeringId = event.metadata.offeringId;
            if (!saleCounts[offeringId]) {
              saleCounts[offeringId] = 0;
            }
            saleCounts[offeringId]++;
          }
        });

        // Calculate conversion rates and create result array
        const results = Object.entries(viewCounts).map(([offeringId, data]) => {
          const views = data.count;
          const sales = saleCounts[offeringId] || 0;
          const conversionRate = views > 0 ? (sales / views) * 100 : 0;
          
          return {
            offeringId,
            offeringTitle: data.title,
            views,
            sales,
            conversionRate,
          };
        });

        // Sort by conversion rate (highest first)
        results.sort((a, b) => b.conversionRate - a.conversionRate);

        return results;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Unexpected error fetching offering performance:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching offering performance data",
        });
      }
    }),
});