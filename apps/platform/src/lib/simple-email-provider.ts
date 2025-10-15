/**
 * Simple Email Provider for NextAuth.js
 *
 * This module provides a simplified implementation of the EmailProvider for NextAuth.js
 * that uses a fetch request to an API route to send verification emails.
 */

import type {
  EmailConfig,
  EmailProviderSendVerificationRequestParams,
} from "next-auth/providers/email";

/**
 * Create a custom email verification request handler that uses a fetch request to an API route
 */
export async function sendSimpleVerificationRequest({
  identifier: email,
  url,
  provider,
  token,
  expires,
  theme,
  request,
}: EmailProviderSendVerificationRequestParams) {
  try {
    console.log(
      "[NextAuth Simple Email] Sending verification email to:",
      email,
    );
    console.log("[NextAuth Simple Email] Verification URL:", url);

    // Extract host and base URL from the verification URL
    let parsedUrl = new URL(url);
    let host = parsedUrl.host;

    // Create email subject - use a more user-friendly name if available
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ishan Parihar";
    const subject = `Sign in to ${siteName}`;

    // Get the base URL from the verification URL
    // This is the most reliable way to get the correct base URL
    let baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // CRITICAL SAFEGUARD: Prevent localhost URLs in production
    if (
      process.env.NODE_ENV === "production" &&
      baseUrl.includes("localhost")
    ) {
      console.error(
        "[NextAuth Simple Email] CRITICAL ERROR: Localhost URL detected in production!",
      );
      console.error(
        "[NextAuth Simple Email] This would result in broken magic links.",
      );

      // Try to use a fallback URL from environment variables
      let productionUrl;
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        productionUrl = process.env.NEXT_PUBLIC_BASE_URL.split(",")[0];
        console.log(
          "[NextAuth Simple Email] Using NEXT_PUBLIC_BASE_URL as fallback:",
          productionUrl,
        );
      } else if (process.env.VERCEL_URL) {
        productionUrl = `https://${process.env.VERCEL_URL}`;
        console.log(
          "[NextAuth Simple Email] Using VERCEL_URL as fallback:",
          productionUrl,
        );
      }

      if (productionUrl) {
        // Replace the localhost URL with the production URL
        const correctedUrl = url.replace(baseUrl, productionUrl);
        console.log(
          "[NextAuth Simple Email] Corrected verification URL:",
          correctedUrl,
        );

        // Update the URL and baseUrl
        url = correctedUrl;
        parsedUrl = new URL(url);
        baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
        host = parsedUrl.host;
        console.log("[NextAuth Simple Email] Corrected baseUrl:", baseUrl);
      } else {
        console.error(
          "[NextAuth Simple Email] No production URL available for correction!",
        );
        // Continue with the localhost URL as a last resort
      }
    }

    // Log the extracted base URL and the original verification URL
    console.log("[NextAuth Simple Email] Final verification URL:", url);
    console.log("[NextAuth Simple Email] Final baseUrl:", baseUrl);
    console.log("[NextAuth Simple Email] Environment variables:", {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
        ? "set"
        : "not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "set" : "not set",
      VERCEL_URL: process.env.VERCEL_URL ? "set" : "not set",
      NODE_ENV: process.env.NODE_ENV,
    });

    // Construct absolute URL for the API endpoint
    const apiUrl = `${baseUrl}/api/send-email`;
    console.log("[NextAuth Simple Email] Calling API route:", apiUrl);

    // Send the email using the API route
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject,
          url,
          host,
        }),
      });

      // Log the response status
      console.log(
        "[NextAuth Simple Email] API response status:",
        response.status,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[NextAuth Simple Email] API error response:", errorText);
        throw new Error(errorText || "Failed to send verification email");
      }

      // Try to parse the response as JSON for more details
      try {
        const responseData = await response.json();
        console.log("[NextAuth Simple Email] API response data:", responseData);
      } catch (jsonError) {
        console.log(
          "[NextAuth Simple Email] Response is not JSON:",
          await response.text(),
        );
      }

      console.log(
        "[NextAuth Simple Email] Verification email sent successfully to:",
        email,
      );
    } catch (fetchError) {
      console.error("[NextAuth Simple Email] Fetch error:", fetchError);
      // Check if it's a network error which might indicate a cross-origin issue
      if (
        fetchError instanceof TypeError &&
        fetchError.message.includes("network")
      ) {
        console.error(
          "[NextAuth Simple Email] This appears to be a network error, which might indicate a CORS issue or that the API route is not accessible",
        );
      }
      throw new Error(
        `Failed to send verification email to ${email}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      );
    }
  } catch (error) {
    console.error(
      "[NextAuth Simple Email] Error sending verification email:",
      error,
    );
    // Log additional context that might help diagnose the issue
    console.error("[NextAuth Simple Email] Context:", {
      email,
      baseUrl:
        process.env.NEXTAUTH_URL ||
        process.env.VERCEL_URL ||
        "http://localhost:3000",
      emailProviderConfigured: !!process.env.EMAIL_FROM,
      gmailCredentialsConfigured: !!(
        process.env.GMAIL_CLIENT_ID &&
        process.env.GMAIL_CLIENT_SECRET &&
        process.env.GMAIL_REFRESH_TOKEN &&
        process.env.GMAIL_USER_EMAIL
      ),
    });
    throw new Error(
      `Failed to send verification email to ${email}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Create a verification email with a sign-in link
 */
function createVerificationEmail({
  url,
  host,
}: {
  url: string;
  host: string;
}): string {
  // Get a user-friendly site name
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ishan Parihar";

  // Escape the host to prevent it from being interpreted as a link in email clients
  const escapedHost = host.replace(/\./g, "&#8203;.");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${siteName}</title>
  <style>
    /* Import fonts to match website */
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Istok+Web:wght@400;700&family=Playfair+Display&display=swap');

    body {
      font-family: 'Raleway', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #FFFFFF;
      margin: 0;
      padding: 0;
      background-color: #1C1C1F; /* Dark Charcoal - matches website */
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #181818; /* Deepest charcoal - matches website surface-elevated */
      border-radius: 0; /* Rectangular corners to match website */
      border: 1px solid #2E2E32; /* ui-border dark mode */
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #2E2E32; /* ui-border dark mode */
    }
    .header h1 {
      color: #0FA4AF; /* Brand accent */
      font-family: 'Playfair Display', serif; /* Main heading font from website */
      font-weight: 700; /* Playfair Display bold */
      letter-spacing: -0.02em; /* Matches website heading style */
      margin: 0;
    }
    .content {
      padding: 20px 0;
      text-align: center;
      color: #B8B8B8; /* text-secondary for dark mode */
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #0FA4AF; /* Brand accent */
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 0; /* Rectangular corners to match website */
      font-weight: 600;
      font-family: 'Raleway', sans-serif;
      margin: 20px 0;
      border: 1px solid #0FA4AF;
      transition: all 0.2s ease; /* Matches website transition */
    }
    .button:hover {
      background-color: #0D8A94; /* brand-accent-hover */
      border-color: #0D8A94;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      color: #B8B8B8; /* text-secondary for dark mode */
      font-size: 0.8em;
      border-top: 1px solid #2E2E32; /* ui-border dark mode */
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sign in to ${siteName}</h1>
    </div>
    <div class="content">
      <p>Click the button below to sign in to your account.</p>
      <a href="${url}" class="button">Sign in</a>
      <p>If you did not request this email, you can safely ignore it.</p>
      <p>This link will expire in 24 hours.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Create a simple email provider configuration for NextAuth.js
 */
export function createSimpleEmailProvider(
  options?: Partial<EmailConfig>,
): EmailConfig {
  return {
    id: "email",
    type: "email",
    name: "Email",
    server: {}, // Not used but required by type
    from: process.env.EMAIL_FROM || "noreply@example.com",
    maxAge: 24 * 60 * 60, // 24 hours
    sendVerificationRequest: sendSimpleVerificationRequest,
    ...options,
  };
}
