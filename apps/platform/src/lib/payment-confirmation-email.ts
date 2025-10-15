/**
 * Payment Confirmation Email Module
 *
 * This module provides functionality for sending payment confirmation emails
 * with beautiful templates that match the site's theme.
 *
 * Note: Email functionality moved to Server Actions in src/app/actions/email.ts
 */

// import { sendEmail } from './emailService.server'; // REMOVED - use Server Actions instead
import { formatCurrency } from "./payments";

export interface PaymentConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  serviceType: string;
  amount: number;
  currency: string;
  paidAt: string;
  bookingInstructions?: string;
  pricingTierName?: string;
  // Digital content fields
  serviceId?: string;
  hasDigitalContent?: boolean;
  digitalContentFilename?: string;
  digitalContentDescription?: string;
  digitalContentDownloadUrl?: string;
}

export interface PaymentFailureData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  failureReason: string;
  retryLink: string;
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  data: PaymentConfirmationData,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log(
      "[Payment Email] Sending payment confirmation email to:",
      data.customerEmail,
    );

    const subject = `Payment Confirmed - ${data.serviceName}`;
    const htmlContent = createPaymentConfirmationEmailContent(data);

    // Email functionality moved to Server Actions
    console.log("[Payment Email] Email functionality moved to Server Actions");

    return {
      success: false,
      message: "Email functionality moved to Server Actions",
      error: "Use Server Actions instead",
    };
  } catch (error) {
    console.error(
      "[Payment Email] Error in sendPaymentConfirmationEmail:",
      error,
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to send payment confirmation email",
      error: errorMessage,
    };
  }
}

/**
 * Send payment failure email
 */
export async function sendPaymentFailureEmail(
  data: PaymentFailureData,
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    console.log(
      "[Payment Email] Sending payment failure email to:",
      data.customerEmail,
    );

    const subject = `Payment Failed - ${data.serviceName}`;
    const htmlContent = createPaymentFailureEmailContent(data);

    // Email functionality moved to Server Actions
    console.log("[Payment Email] Email functionality moved to Server Actions");

    return {
      success: false,
      message: "Email functionality moved to Server Actions",
      error: "Use Server Actions instead",
    };
  } catch (error) {
    console.error("[Payment Email] Error in sendPaymentFailureEmail:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: "Failed to send payment failure email",
      error: errorMessage,
    };
  }
}

/**
 * Get booking instructions based on service type
 */
function getBookingInstructions(serviceType: string): string {
  switch (serviceType) {
    case "consultation":
      return "You will receive a calendar invite within 24 hours to schedule your consultation session.";
    case "course":
      return "You will receive access credentials and course materials within 2 hours.";
    case "service":
      return "We will contact you within 24 hours to coordinate the service delivery.";
    case "product":
      return "Your product will be shipped within 2-3 business days. You will receive tracking information via email.";
    default:
      return "We will contact you within 24 hours with next steps and any additional information.";
  }
}

/**
 * Create payment confirmation email content
 */
function createPaymentConfirmationEmailContent(
  data: PaymentConfirmationData,
): string {
  const formattedAmount = formatCurrency(data.amount, data.currency);
  const formattedDate = new Date(data.paidAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const instructions =
    data.bookingInstructions || getBookingInstructions(data.serviceType);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - ${data.serviceName}</title>
  <style>
    /* Import fonts to match website */
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Istok+Web:wght@400;700&family=Playfair+Display&display=swap');

    body {
      font-family: 'Raleway', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #111111;
      margin: 0;
      padding: 0;
      background-color: #E8E8DE; /* Eggshell background to match site */
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #FFFFFF;
      border: 1px solid #D4D4D8;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 2px solid #0FA4AF;
      background: linear-gradient(135deg, #0FA4AF 0%, #0891B2 100%);
      color: white;
      margin: -20px -20px 30px -20px;
    }
    .header h1 {
      color: white;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: -0.02em;
      margin: 0 0 10px 0;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 0 0 20px 0;
    }
    .success-icon {
      text-align: center;
      margin: 20px 0;
    }
    .success-icon::before {
      content: "✓";
      display: inline-block;
      width: 60px;
      height: 60px;
      line-height: 60px;
      background-color: #10B981;
      color: white;
      border-radius: 50%;
      font-size: 30px;
      font-weight: bold;
    }
    .order-details {
      background-color: #F8F9FA;
      border: 1px solid #E5E7EB;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #0FA4AF;
    }
    .order-details h3 {
      margin: 0 0 15px 0;
      color: #0FA4AF;
      font-family: 'Playfair Display', serif;
      font-size: 20px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      padding: 5px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .detail-row:last-child {
      border-bottom: none;
      font-weight: 600;
      font-size: 18px;
      color: #0FA4AF;
    }
    .detail-label {
      font-weight: 500;
      color: #374151;
    }
    .detail-value {
      color: #111111;
    }
    .instructions {
      background-color: #EFF6FF;
      border: 1px solid #DBEAFE;
      border-left: 4px solid #3B82F6;
      padding: 20px;
      margin: 20px 0;
    }
    .instructions h3 {
      margin: 0 0 10px 0;
      color: #1E40AF;
      font-size: 18px;
    }
    .cta-button {
      display: block;
      width: 200px;
      margin: 30px auto;
      padding: 15px 20px;
      background: linear-gradient(135deg, #0FA4AF 0%, #0891B2 100%);
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 0;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      text-decoration: none;
      color: white;
    }
    .footer {
      text-align: center;
      padding: 30px 0 0 0;
      font-size: 14px;
      color: #6B7280;
      border-top: 1px solid #E5E7EB;
      margin-top: 30px;
    }
    .footer p {
      margin: 5px 0;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #0FA4AF;
      text-decoration: none;
      margin: 0 10px;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1C1C1F;
        color: #FFFFFF;
      }
      .container {
        background-color: #181818;
        border-color: #2E2E32;
      }
      .order-details {
        background-color: #2A2A2E;
        border-color: #3E3E42;
      }
      .instructions {
        background-color: #1E293B;
        border-color: #334155;
      }
      .detail-value {
        color: #FFFFFF;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Confirmed!</h1>
      <p>Thank you for your purchase, ${data.customerName}</p>
    </div>
    
    <div class="content">
      <div class="success-icon"></div>
      
      <p>Your payment has been successfully processed. Here are the details of your purchase:</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <div class="detail-row">
          <span class="detail-label">Order Number:</span>
          <span class="detail-value">${data.orderNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${data.serviceName}</span>
        </div>
        ${
          data.pricingTierName
            ? `
        <div class="detail-row">
          <span class="detail-label">Package:</span>
          <span class="detail-value">${data.pricingTierName}</span>
        </div>
        `
            : ""
        }
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value">${formattedAmount}</span>
        </div>
      </div>
      
      <div class="instructions">
        <h3>What's Next?</h3>
        <p>${instructions}</p>
      </div>

      ${
        data.hasDigitalContent
          ? `
      <div class="instructions" style="background-color: #F0F9FF; border-color: #0EA5E9; border-left-color: #0EA5E9;">
        <h3 style="color: #0369A1;">📥 Digital Content Available</h3>
        <p>Your purchase includes digital content that you can download immediately:</p>
        <div style="background-color: white; border: 1px solid #E0E7FF; padding: 15px; margin: 15px 0; border-radius: 0;">
          <p><strong>File:</strong> ${data.digitalContentFilename || "Digital Content"}</p>
          ${data.digitalContentDescription ? `<p><strong>Description:</strong> ${data.digitalContentDescription}</p>` : ""}
          <a href="${data.digitalContentDownloadUrl}"
             style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: linear-gradient(135deg, #0FA4AF 0%, #0891B2 100%); color: white; text-decoration: none; border-radius: 0; font-weight: 600;">
            Download Now
          </a>
        </div>
        <p style="font-size: 12px; color: #6B7280; margin-top: 10px;">
          💡 Tip: Save this email for future access to your digital content.
        </p>
      </div>
      `
          : ""
      }
      
      <a href="${process.env.NEXTAUTH_URL || "https://ishanparihar.com"}/account" class="cta-button">
        View My Account
      </a>
      
      <p>If you have any questions or concerns about your purchase, please don't hesitate to contact us. We're here to help!</p>
      
      <p>Thank you for choosing our services. We look forward to working with you!</p>
      
      <p>Best regards,<br><strong>Ishan Parihar</strong></p>
    </div>
    
    <div class="footer">
      <div class="social-links">
        <a href="mailto:ishan.parihar.official@gmail.com">Contact Support</a> |
        <a href="${process.env.NEXTAUTH_URL || "https://ishanparihar.com"}">Visit Website</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Ishan Parihar. All rights reserved.</p>
      <p>This email was sent to ${data.customerEmail} regarding order ${data.orderNumber}.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Create payment failure email content
 */
function createPaymentFailureEmailContent(data: PaymentFailureData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed - ${data.serviceName}</title>
  <style>
    /* Import fonts to match website */
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Istok+Web:wght@400;700&family=Playfair+Display&display=swap');

    body {
      font-family: 'Raleway', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #111111;
      margin: 0;
      padding: 0;
      background-color: #E8E8DE;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #FFFFFF;
      border: 1px solid #D4D4D8;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 2px solid #EF4444;
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
      margin: -20px -20px 30px -20px;
    }
    .header h1 {
      color: white;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: -0.02em;
      margin: 0 0 10px 0;
    }
    .content {
      padding: 0 0 20px 0;
    }
    .error-icon {
      text-align: center;
      margin: 20px 0;
    }
    .error-icon::before {
      content: "✗";
      display: inline-block;
      width: 60px;
      height: 60px;
      line-height: 60px;
      background-color: #EF4444;
      color: white;
      border-radius: 50%;
      font-size: 30px;
      font-weight: bold;
    }
    .error-details {
      background-color: #FEF2F2;
      border: 1px solid #FECACA;
      border-left: 4px solid #EF4444;
      padding: 20px;
      margin: 20px 0;
    }
    .retry-button {
      display: block;
      width: 200px;
      margin: 30px auto;
      padding: 15px 20px;
      background: linear-gradient(135deg, #0FA4AF 0%, #0891B2 100%);
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 0;
      font-weight: 600;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      padding: 30px 0 0 0;
      font-size: 14px;
      color: #6B7280;
      border-top: 1px solid #E5E7EB;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Failed</h1>
      <p>We encountered an issue processing your payment</p>
    </div>

    <div class="content">
      <div class="error-icon"></div>

      <p>Hello ${data.customerName},</p>

      <p>We're sorry, but we were unable to process your payment for <strong>${data.serviceName}</strong>.</p>

      <div class="error-details">
        <h3>Order Details</h3>
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Service:</strong> ${data.serviceName}</p>
        <p><strong>Reason:</strong> ${data.failureReason}</p>
      </div>

      <p>Don't worry - you can try again! Here are a few things you can check:</p>
      <ul>
        <li>Verify your card details are correct</li>
        <li>Ensure you have sufficient funds</li>
        <li>Check if your card supports online transactions</li>
        <li>Try using a different payment method</li>
      </ul>

      <a href="${data.retryLink}" class="retry-button">
        Try Payment Again
      </a>

      <p>If you continue to experience issues, please contact our support team and we'll be happy to help you complete your purchase.</p>

      <p>Best regards,<br><strong>Ishan Parihar</strong></p>
    </div>

    <div class="footer">
      <p><a href="mailto:ishan.parihar.official@gmail.com">Contact Support</a></p>
      <p>&copy; ${new Date().getFullYear()} Ishan Parihar. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
