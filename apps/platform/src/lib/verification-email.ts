/**
 * Verification Email Module
 *
 * This module provides functionality for sending verification emails
 * for user authentication and other verification purposes.
 *
 * Note: Email functionality moved to Server Actions in src/app/actions/email.ts
 */

// import { sendEmail } from './emailService.server'; // REMOVED - use Server Actions instead

/**
 * Send a verification email
 * @param email Recipient email address
 * @param name Recipient name (optional)
 * @param verificationCode Verification code or token
 * @param verificationLink Full verification link (optional)
 * @returns Object with success status and message or error
 */
export async function sendVerificationEmail(
  email: string,
  name?: string,
  verificationCode?: string,
  verificationLink?: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log(
      "[Verification] Starting to send verification email to:",
      email,
    );

    if (!email || !email.includes("@")) {
      return {
        success: false,
        message: "Invalid email address",
        error: "Email is required and must be valid",
      };
    }

    // Prepare email content
    const subject = "Verify Your Email Address";
    const content = createVerificationEmailContent(
      name || "there",
      verificationCode,
      verificationLink,
      email,
    );

    // Email functionality moved to Server Actions
    console.log("[Verification] Email functionality moved to Server Actions");

    return {
      success: false,
      message: "Email functionality moved to Server Actions",
      error: "Use Server Actions instead",
    };
  } catch (error) {
    console.error("[Verification] Error in sendVerificationEmail:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to send verification email",
      error: errorMessage,
    };
  }
}

/**
 * Create verification email content
 * @param name Recipient name
 * @param verificationCode Verification code (optional)
 * @param verificationLink Verification link (optional)
 * @param email Recipient email
 * @returns HTML content for the verification email
 */
function createVerificationEmailContent(
  name: string,
  verificationCode?: string,
  verificationLink?: string,
  email?: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email Address</title>
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
    .verification-code {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 4px;
      margin: 20px 0;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .verification-button {
      display: block;
      width: 200px;
      margin: 20px auto;
      padding: 12px 20px;
      background-color: #3b82f6;
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    <div class="content">
      <p>Hello ${name},</p>

      <p>Thank you for registering with us. Please verify your email address to complete your registration.</p>

      ${
        verificationCode
          ? `
      <p>Your verification code is:</p>
      <div class="verification-code">${verificationCode}</div>
      <p>Please enter this code on the verification page to confirm your email address.</p>
      `
          : ""
      }

      ${
        verificationLink
          ? `
      <p>Alternatively, you can click the button below to verify your email address:</p>
      <a href="${verificationLink}" class="verification-button">Verify Email</a>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      `
          : ""
      }

      <p>If you didn't request this verification, please ignore this email or contact our support team if you have any concerns.</p>

      <p>Best regards,<br>Ishan Parihar</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Ishan Parihar. All rights reserved.</p>
      <p>This email was sent to ${email || "you"} for verification purposes.</p>
    </div>
  </div>
</body>
</html>
  `;
}
