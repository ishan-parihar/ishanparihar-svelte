/**
 * Password Reset Email Module
 *
 * This module provides functions to send password reset emails.
 *
 * Note: Email functionality moved to Server Actions in src/app/actions/email.ts
 */

// import { sendEmail } from './emailService.server'; // REMOVED - use Server Actions instead

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    if (!email) {
      return {
        success: false,
        message: "Invalid email",
        error: "Email is required",
      };
    }

    // Prepare email content
    const emailSubject = "Reset Your Password";
    const emailContent = createPasswordResetEmailContent(resetLink);

    // Email functionality moved to Server Actions
    console.log("[Password Reset] Email functionality moved to Server Actions");

    return {
      success: false,
      message: "Email functionality moved to Server Actions",
      error: "Use Server Actions instead",
    };
  } catch (error) {
    console.error(
      "[Password Reset] Unexpected error in sendPasswordResetEmail:",
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
 * Create password reset email content
 * @param resetLink Password reset link
 * @returns HTML content for the password reset email
 */
function createPasswordResetEmailContent(resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
    .note {
      font-size: 12px;
      color: #666;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hello,</p>

      <p>We received a request to reset your password. Click the button below to create a new password:</p>

      <p style="text-align: center;">
        <a href="${resetLink}" class="btn">Reset Password</a>
      </p>

      <p>If you didn't request a password reset, you can safely ignore this email.</p>

      <p>The password reset link will expire in 1 hour for security reasons.</p>

      <p class="note">If the button above doesn't work, copy and paste this link into your browser: <br>${resetLink}</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Ishan Parihar. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
