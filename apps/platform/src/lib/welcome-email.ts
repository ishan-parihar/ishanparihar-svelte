/**
 * Welcome Email Module
 *
 * This module provides functions to send welcome emails to new subscribers.
 */

import { NewsletterSubscriber } from "./newsletterService";
import { createServerClient } from "@supabase/ssr";
import { Database } from "./supabase";

/**
 * Send a welcome email to a new subscriber
 * @param subscriber The subscriber to send the welcome email to
 * @param customSubject Optional custom subject for the email
 * @param customContent Optional custom content for the email
 * @returns Object with success status and message or error
 */
export async function sendWelcomeEmail(
  subscriber: NewsletterSubscriber,
  customSubject?: string,
  customContent?: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log(
      "[Welcome Email] Starting to send welcome email to:",
      subscriber.email,
    );

    if (!subscriber || !subscriber.email) {
      return {
        success: false,
        message: "Invalid subscriber data",
        error: "Email is required",
      };
    }

    // Create a direct Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[Welcome Email] Missing Supabase credentials");
      return {
        success: false,
        message: "Service unavailable",
        error: "Missing Supabase credentials",
      };
    }

    // Create a direct Supabase client with service role key
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        // No cookies needed for this operation
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      },
    );

    // Try to get the latest welcome email template
    let emailSubject = customSubject || "Welcome to Our Newsletter!";
    let emailContent = customContent;

    if (!emailContent) {
      try {
        // Check if the welcome_email_templates table exists and get the latest template
        const { data: templates, error: templateError } = await supabase
          .from("welcome_email_templates")
          .select("*")
          .eq("is_enabled", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!templateError && templates && templates.length > 0) {
          emailSubject = templates[0].subject;
          emailContent = templates[0].content;
        }
      } catch (templateError) {
        console.error(
          "[Welcome Email] Error fetching template:",
          templateError,
        );
        // Continue with default template
      }
    }

    // If no custom content or template was found, use the default
    if (!emailContent) {
      emailContent = createWelcomeEmailContent(
        subscriber.name || "there",
        subscriber.unsubscribe_token || "",
      );
    } else {
      // Replace variables in the template
      emailContent = emailContent
        .replace(/{name}/g, subscriber.name || "there")
        .replace(/{email}/g, subscriber.email)
        .replace(
          /{unsubscribe_link}/g,
          createUnsubscribeLink(subscriber.unsubscribe_token || ""),
        );
    }

    // Check if Gmail API credentials are configured
    let result;

    // Email functionality moved to Server Actions
    console.log("[Welcome Email] Email functionality moved to Server Actions");

    result = {
      success: false,
      message: "Email functionality moved to Server Actions",
      error: "Use Server Actions instead",
    };

    return result;
  } catch (error) {
    console.error(
      "[Welcome Email] Unexpected error in sendWelcomeEmail:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "An unexpected error occurred",
      error: errorMessage,
    };
  }
}

/**
 * Create unsubscribe link
 * @param unsubscribeToken Unsubscribe token
 * @returns Unsubscribe URL
 */
function createUnsubscribeLink(unsubscribeToken: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.split(",")[0] || "http://localhost:3000";
  return `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
}

/**
 * Create welcome email content
 * @param name Subscriber name
 * @param unsubscribeToken Unsubscribe token
 * @returns HTML content for the welcome email
 */
function createWelcomeEmailContent(
  name: string,
  unsubscribeToken: string,
): string {
  const unsubscribeUrl = createUnsubscribeLink(unsubscribeToken);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Newsletter!</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eaeaea;
    }
    .content {
      padding: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eaeaea;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 10px 0;
    }
    .btn:hover {
      background-color: #2563eb;
    }
    .unsubscribe {
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Our Newsletter!</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>

      <p>Thank you for subscribing to our newsletter! We're excited to have you join our community.</p>

      <p>Here's what you can expect from us:</p>
      <ul>
        <li>Insights on spiritual growth and conscious evolution</li>
        <li>Exclusive content and updates</li>
        <li>Tips and resources to enhance your journey</li>
      </ul>

      <p>We're committed to providing valuable content and we promise not to spam your inbox.</p>

      <p>If you have any questions or feedback, feel free to reply to this email.</p>

      <p>Best regards,<br>Ishan Parihar</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Ishan Parihar. All rights reserved.</p>
      <p class="unsubscribe">If you no longer wish to receive these emails, you can <a href="${unsubscribeUrl}">unsubscribe here</a>.</p>
    </div>
  </div>
</body>
</html>
  `;
}
