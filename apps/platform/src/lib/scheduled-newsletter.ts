/**
 * Scheduled Newsletter Module
 *
 * This module provides functionality for scheduling and sending newsletters
 * at specified times.
 */

import {
  NewsletterCampaign,
  getNewsletterCampaignById,
  getNewsletterSubscribers,
  updateNewsletterCampaign,
} from "./newsletterService";
// import { sendBulkEmail } from './emailService.server'; // REMOVED - use Server Actions instead

/**
 * Schedule a newsletter campaign to be sent at a specific time
 * @param campaignId ID of the campaign to schedule
 * @param scheduledTime Time to send the campaign (ISO string or Date object)
 * @returns Object with success status and message or error
 */
export async function scheduleNewsletterCampaign(
  campaignId: string,
  scheduledTime: string | Date,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log(
      `[Scheduled Newsletter] Scheduling campaign ${campaignId} for ${scheduledTime}`,
    );

    // Get the campaign
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) {
      return {
        success: false,
        message: "Campaign not found",
        error: `Campaign with ID ${campaignId} not found`,
      };
    }

    // Check if campaign is already sent
    if (campaign.status === "sent") {
      return {
        success: false,
        message: "Campaign has already been sent",
        error: "Cannot schedule a campaign that has already been sent",
      };
    }

    // Convert scheduledTime to Date if it's a string
    const scheduledDate =
      typeof scheduledTime === "string"
        ? new Date(scheduledTime)
        : scheduledTime;

    // Check if the scheduled time is in the future
    if (scheduledDate.getTime() <= Date.now()) {
      return {
        success: false,
        message: "Scheduled time must be in the future",
        error: "Cannot schedule a campaign for a time in the past",
      };
    }

    // Calculate the delay in milliseconds
    const delay = scheduledDate.getTime() - Date.now();

    // Schedule the campaign
    setTimeout(async () => {
      await sendScheduledCampaign(campaignId);
    }, delay);

    // Update the campaign status to "scheduled"
    await updateNewsletterCampaign(campaignId, {
      status: "scheduled",
      // You might want to add a scheduled_at field to your database schema
    });

    return {
      success: true,
      message: `Campaign scheduled to be sent at ${scheduledDate.toISOString()}`,
    };
  } catch (error) {
    console.error("[Scheduled Newsletter] Error scheduling campaign:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to schedule campaign",
      error: errorMessage,
    };
  }
}

/**
 * Send a scheduled campaign
 * @param campaignId ID of the campaign to send
 * @returns Object with success status and message or error
 */
async function sendScheduledCampaign(
  campaignId: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log(
      `[Scheduled Newsletter] Sending scheduled campaign ${campaignId}`,
    );

    // Get the campaign
    const campaign = await getNewsletterCampaignById(campaignId);
    if (!campaign) {
      return {
        success: false,
        message: "Campaign not found",
        error: `Campaign with ID ${campaignId} not found`,
      };
    }

    // Check if campaign is already sent
    if (campaign.status === "sent") {
      return {
        success: false,
        message: "Campaign has already been sent",
        error: "Cannot send a campaign that has already been sent",
      };
    }

    // Update campaign status to sending
    await updateNewsletterCampaign(campaignId, { status: "sending" });

    // Get active subscribers
    const subscribersResult = await getNewsletterSubscribers({
      activeOnly: true,
    });
    const subscribers = subscribersResult.subscribers;

    if (subscribers.length === 0) {
      await updateNewsletterCampaign(campaignId, { status: "failed" });
      return {
        success: false,
        message: "No active subscribers to send to",
        error: "No active subscribers",
      };
    }

    // Email functionality moved to Server Actions
    console.log("[Newsletter] Email functionality moved to Server Actions");
    const result = {
      success: false,
      message: "Email functionality moved to Server Actions",
      error: "Use Server Actions instead",
    };

    // Update campaign status based on result
    if (result.success) {
      await updateNewsletterCampaign(campaignId, {
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: subscribers.length,
      });
    } else {
      await updateNewsletterCampaign(campaignId, {
        status: "failed",
      });
    }

    return result;
  } catch (error) {
    console.error(
      "[Scheduled Newsletter] Error sending scheduled campaign:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Update campaign status to failed
    try {
      await updateNewsletterCampaign(campaignId, { status: "failed" });
    } catch (updateError) {
      console.error(
        "[Scheduled Newsletter] Error updating campaign status:",
        updateError,
      );
    }

    return {
      success: false,
      message: "Failed to send scheduled campaign",
      error: errorMessage,
    };
  }
}
