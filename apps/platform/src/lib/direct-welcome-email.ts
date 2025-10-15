/**
 * Direct Welcome Email Module
 *
 * This module provides a direct implementation for sending welcome emails
 * using the Gmail API without any dependencies on other modules.
 *
 * Note: Email functionality moved to Server Actions in src/app/actions/email.ts
 */

// import { sendEmail } from './emailService.server'; // REMOVED - use Server Actions instead

// Note: Gmail API credentials are now loaded from environment variables in direct-gmail.ts

/**
 * Send a welcome email directly using Gmail API
 * @param email Recipient email address
 * @param name Recipient name (optional)
 * @param customSubject Custom subject (optional)
 * @param customContent Custom HTML content (optional)
 * @returns Object with success status and message or error
 */
export async function sendDirectWelcomeEmail(
  email: string,
  name?: string,
  customSubject?: string,
  customContent?: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log("[Direct Welcome] Starting to send welcome email to:", email);

    if (!email || !email.includes("@")) {
      return {
        success: false,
        message: "Invalid email address",
        error: "Email is required and must be valid",
      };
    }

    // Prepare email content
    const subject = customSubject || "Welcome to Our Newsletter!";
    let content = customContent;

    // If no custom content was provided, use the default
    if (!content) {
      content = createWelcomeEmailContent(name || "there");
    } else {
      // Replace variables in the template
      content = content
        .replace(/{name}/g, name || "there")
        .replace(/{email}/g, email);
    }

    // Email functionality moved to Server Actions
    console.log("[Direct Welcome] Email functionality moved to Server Actions");
    return {
      success: false,
      message: "Email functionality moved to Server Actions",
      error: "Use Server Actions instead",
    };
  } catch (error) {
    console.error("[Direct Welcome] Error in sendDirectWelcomeEmail:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to send welcome email",
      error: errorMessage,
    };
  }
}

/**
 * Create welcome email content
 * @param name Recipient name
 * @returns HTML content for the welcome email
 */
function createWelcomeEmailContent(name: string): string {
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
      <p class="unsubscribe">If you no longer wish to receive these emails, you can reply with "Unsubscribe" in the subject line.</p>
    </div>
  </div>
</body>
</html>
  `;
}
