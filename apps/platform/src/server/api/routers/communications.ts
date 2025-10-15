/**
 * Communications tRPC Router
 * Handles email sending and communication operations
 */

import { createTRPCRouter, adminProcedure } from "@/lib/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
// Note: Email functionality moved to Server Actions

export const communicationsRouter = createTRPCRouter({
  // Email functionality moved to Server Actions in src/app/actions/email.ts
  // This router can be extended with other communication features
});

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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sign in to ${siteName}</title>
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Import fonts to match website */
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');

    body {
      font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #FFFFFF;
      margin: 0;
      padding: 0;
      background: #1C1C1F;
      min-height: 100vh;
    }

    .email-wrapper {
      width: 100%;
      padding: 40px 20px;
      background: #1C1C1F;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #181818;
      border-radius: 0;
      overflow: hidden;
      border: 1px solid #2E2E32;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .header {
      background: linear-gradient(135deg, #0FA4AF 0%, #0D8A94 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
      border-bottom: 1px solid #2E2E32;
    }

    .header h1 {
      color: #FFFFFF;
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: -0.02em;
    }

    .content {
      padding: 50px 40px;
      text-align: center;
      background: #181818;
    }

    .welcome-text {
      font-size: 18px;
      color: #B8B8B8;
      font-family: 'Raleway', sans-serif;
      margin-bottom: 30px;
      line-height: 1.7;
    }

    .sign-in-button {
      display: inline-block;
      padding: 16px 32px;
      background: #0FA4AF;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 0;
      font-family: 'Raleway', sans-serif;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s ease;
      border: 1px solid #0FA4AF;
      cursor: pointer;
    }

    .sign-in-button:hover {
      background: #0D8A94;
      border-color: #0D8A94;
    }

    .footer {
      background: #1C1C1F;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #2E2E32;
    }

    .footer-content {
      color: #B8B8B8;
      font-family: 'Raleway', sans-serif;
      font-size: 14px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <h1>Welcome back!</h1>
        <p>Sign in to ${siteName}</p>
      </div>

      <div class="content">
        <div class="welcome-text">
          <p>We received a request to sign you in to your account. Click the button below to securely access your dashboard.</p>
        </div>

        <div class="cta-section">
          <a href="${url}" class="sign-in-button">
            🚀 Sign In Securely
          </a>
        </div>
      </div>

      <div class="footer">
        <div class="footer-content">
          <p><strong>${siteName}</strong></p>
          <p>This email was sent because you requested to sign in to your account.</p>
          <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}
