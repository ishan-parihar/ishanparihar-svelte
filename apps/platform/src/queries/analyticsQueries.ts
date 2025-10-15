/**
 * Analytics Queries
 * Server-side functions to fetch analytics data from Supabase
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase";

/**
 * Get the total number of events
 */
export async function getTotalEvents(supabase: SupabaseClient<Database>) {
  try {
    const { count, error } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching total events:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getTotalEvents:", error);
    return 0;
  }
}

/**
 * Get the number of unique visitors (sessions)
 */
export async function getUniqueVisitors(supabase: SupabaseClient<Database>) {
  try {
    const { count, error } = await supabase
      .from("analytics_events")
      .select("session_id", { count: "exact", head: true })
      .neq("session_id", null)
      .not("session_id", "is", null);

    if (error) {
      console.error("Error fetching unique visitors:", error);
      return 0;
    }

    // Since we can't directly count distinct values with head: true,
    // we'll need to fetch the data and count distinct values
    const { data, error: dataError } = await supabase
      .from("analytics_events")
      .select("session_id")
      .neq("session_id", null)
      .not("session_id", "is", null);

    if (dataError) {
      console.error("Error fetching session data:", dataError);
      return 0;
    }

    // Count distinct session IDs
    const uniqueSessionIds = new Set(
      data.map((event) => event.session_id).filter(Boolean)
    );
    
    return uniqueSessionIds.size;
  } catch (error) {
    console.error("Error in getUniqueVisitors:", error);
    return 0;
  }
}

/**
 * Get the top events by count
 */
export async function getTopEvents(supabase: SupabaseClient<Database>, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_name")
      .order("created_at", { ascending: false })
      .limit(limit * 2); // Fetch more events to ensure we have enough for grouping

    if (error) {
      console.error("Error fetching events for top events:", error);
      return [];
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

    return topEvents;
  } catch (error) {
    console.error("Error in getTopEvents:", error);
    return [];
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(supabase: SupabaseClient<Database>, days: number = 30) {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    // Get count for each funnel step within the date range
    const { data: viewedOfferingData, error: viewedOfferingError } = await supabase
      .from("analytics_events")
      .select("id")
      .eq("event_name", "Viewed Offering")
      .gte("created_at", fromDate.toISOString());

    if (viewedOfferingError) {
      console.error("Error fetching viewed offering events:", viewedOfferingError);
      return { viewedOffering: 0, initiatedCheckout: 0, completedSale: 0 };
    }

    const { data: initiatedCheckoutData, error: initiatedCheckoutError } = await supabase
      .from("analytics_events")
      .select("id")
      .eq("event_name", "Initiated Checkout")
      .gte("created_at", fromDate.toISOString());

    if (initiatedCheckoutError) {
      console.error("Error fetching initiated checkout events:", initiatedCheckoutError);
      return { viewedOffering: 0, initiatedCheckout: 0, completedSale: 0 };
    }

    const { data: completedSaleData, error: completedSaleError } = await supabase
      .from("analytics_events")
      .select("id")
      .eq("event_name", "Completed Sale")
      .gte("created_at", fromDate.toISOString());

    if (completedSaleError) {
      console.error("Error fetching completed sale events:", completedSaleError);
      return { viewedOffering: 0, initiatedCheckout: 0, completedSale: 0 };
    }

    return {
      viewedOffering: viewedOfferingData.length,
      initiatedCheckout: initiatedCheckoutData.length,
      completedSale: completedSaleData.length,
    };
  } catch (error) {
    console.error("Error in getConversionFunnel:", error);
    return { viewedOffering: 0, initiatedCheckout: 0, completedSale: 0 };
  }
}

/**
 * Get offering performance data
 */
export async function getOfferingPerformance(supabase: SupabaseClient<Database>, days: number = 30) {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    // Get all "Viewed Offering" events
    const { data: viewedEvents, error: viewedError } = await supabase
      .from("analytics_events")
      .select("metadata")
      .eq("event_name", "Viewed Offering")
      .gte("created_at", fromDate.toISOString());

    if (viewedError) {
      console.error("Error fetching viewed offering events:", viewedError);
      return [];
    }

    // Get all "Completed Sale" events
    const { data: saleEvents, error: saleError } = await supabase
      .from("analytics_events")
      .select("metadata")
      .eq("event_name", "Completed Sale")
      .gte("created_at", fromDate.toISOString());

    if (saleError) {
      console.error("Error fetching completed sale events:", saleError);
      return [];
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
    console.error("Error in getOfferingPerformance:", error);
    return [];
  }
}