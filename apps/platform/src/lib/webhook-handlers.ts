/**
 * Webhook Event Handlers
 *
 * This file contains handlers for different RazorPay webhook events
 * and order fulfillment logic
 */

import { createServiceRoleClient } from "@/utils/supabase/server";
import { OrderWithDetails, PaymentWithOrder } from "@/lib/supabase";

// Email notification service (placeholder - implement with your preferred service)
interface EmailNotificationData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

async function sendEmailNotification(
  notification: EmailNotificationData,
): Promise<boolean> {
  try {
    console.log("[Webhook] Sending email notification:", notification.template);

    // Import email functions dynamically to avoid circular dependencies
    const { sendPaymentConfirmationEmail, sendPaymentFailureEmail } =
      await import("./payment-confirmation-email");

    if (notification.template === "payment-confirmation") {
      const result = await sendPaymentConfirmationEmail({
        customerName: notification.data.customerName,
        customerEmail: notification.to,
        orderNumber: notification.data.orderNumber,
        serviceName: notification.data.serviceName,
        serviceType: notification.data.serviceType,
        amount: notification.data.amount,
        currency: notification.data.currency,
        paidAt: notification.data.paidAt,
        bookingInstructions: notification.data.bookingInstructions,
        pricingTierName: notification.data.pricingTierName,
      });

      return result.success;
    } else if (notification.template === "payment-failed") {
      const result = await sendPaymentFailureEmail({
        customerName: notification.data.customerName,
        customerEmail: notification.to,
        orderNumber: notification.data.orderNumber,
        serviceName: notification.data.serviceName,
        failureReason: notification.data.failureReason,
        retryLink: notification.data.retryLink,
      });

      return result.success;
    } else {
      console.warn("[Webhook] Unknown email template:", notification.template);
      return false;
    }
  } catch (error) {
    console.error("[Webhook] Failed to send email notification:", error);
    return false;
  }
}

// Order fulfillment handler
export async function fulfillOrder(orderId: string): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();
    if (!supabase) {
      throw new Error("Failed to initialize Supabase client");
    }

    // Get order details with service information
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        service:service_id(*),
        pricing_tier:pricing_tier_id(*),
        order_items(*)
      `,
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    console.log("[Order Fulfillment] Processing order:", {
      orderId: order.id,
      orderNumber: order.order_number,
      serviceType: order.service?.service_type,
    });

    // Send confirmation email to customer
    const emailSent = await sendEmailNotification({
      to: order.customer_email,
      subject: `Payment Confirmation - ${order.service?.title || "Service"}`,
      template: "payment-confirmation",
      data: {
        customerName: order.customer_name || "Valued Customer",
        orderNumber: order.order_number,
        serviceName: order.service?.title,
        serviceType: order.service?.service_type,
        amount: order.total_amount,
        currency: order.currency,
        paidAt: order.paid_at,
        bookingInstructions: getBookingInstructions(
          order.service?.service_type,
        ),
        pricingTierName: order.pricing_tier?.tier_name,
        // Digital content fields
        serviceId: order.service?.id,
        hasDigitalContent: order.service?.digital_content_enabled || false,
        digitalContentFilename: order.service?.digital_content_filename,
        digitalContentDescription: order.service?.digital_content_description,
        digitalContentDownloadUrl: order.service?.digital_content_enabled
          ? `${process.env.NEXTAUTH_URL}/api/digital-content/download/${order.service.id}?email=${encodeURIComponent(order.customer_email)}`
          : undefined,
      },
    });

    // Send notification to admin
    await sendEmailNotification({
      to: "admin@ishanparihar.com", // Replace with actual admin email
      subject: `New Order Received - ${order.order_number}`,
      template: "admin-order-notification",
      data: {
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        serviceName: order.service?.title,
        amount: order.total_amount,
        currency: order.currency,
        notes: order.notes,
      },
    });

    // Update order status to completed if it's a digital product
    if (order.service?.service_type === "product") {
      await supabase
        .from("orders")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    // Create calendar booking for consultations/services
    if (
      order.service?.service_type === "consultation" ||
      order.service?.service_type === "service"
    ) {
      await createCalendarBooking(order);
    }

    console.log("[Order Fulfillment] Order fulfilled successfully:", orderId);
    return true;
  } catch (error) {
    console.error("[Order Fulfillment] Error fulfilling order:", error);
    return false;
  }
}

// Get booking instructions based on service type
function getBookingInstructions(serviceType: string): string {
  switch (serviceType) {
    case "consultation":
      return "Please check your email for a calendar link to schedule your consultation session.";
    case "service":
      return "Our team will contact you within 24 hours to discuss the next steps for your service.";
    case "course":
      return "You will receive access to your course materials within 24 hours via email.";
    case "product":
      return "Your digital product has been delivered. Check your email for download links.";
    default:
      return "Thank you for your purchase. We will contact you soon with further details.";
  }
}

// Create calendar booking (placeholder)
async function createCalendarBooking(order: any): Promise<boolean> {
  try {
    // TODO: Integrate with calendar service (Google Calendar, Calendly, etc.)
    console.log("[Calendar] Creating booking for order:", order.order_number);

    // This would typically:
    // 1. Create a calendar event
    // 2. Send calendar invite to customer
    // 3. Block time slot in provider's calendar
    // 4. Generate meeting link (Zoom, Google Meet, etc.)

    return true;
  } catch (error) {
    console.error("[Calendar] Failed to create booking:", error);
    return false;
  }
}

// Handle payment captured event
export async function handlePaymentCaptured(payload: any): Promise<void> {
  const payment = payload.payment.entity;

  console.log("[Webhook Handler] Processing payment.captured:", {
    paymentId: payment.id,
    orderId: payment.order_id,
    amount: payment.amount,
  });

  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client");
  }

  // Find the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", payment.order_id)
    .single();

  if (orderError || !order) {
    throw new Error(`Order not found for payment: ${payment.id}`);
  }

  // Update payment status
  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status: "captured",
      method: payment.method,
      gateway_response: payment,
      captured_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_payment_id", payment.id);

  if (paymentUpdateError) {
    throw new Error(`Failed to update payment: ${paymentUpdateError.message}`);
  }

  // Update order status
  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (orderUpdateError) {
    throw new Error(`Failed to update order: ${orderUpdateError.message}`);
  }

  // Fulfill the order (with error handling)
  try {
    await fulfillOrder(order.id);
  } catch (fulfillmentError) {
    console.error(
      "[Webhook Handler] Order fulfillment failed:",
      fulfillmentError,
    );
    // Don't throw error here as the payment was already processed successfully
    // The order fulfillment can be retried later
  }
}

// Handle payment failed event
export async function handlePaymentFailed(payload: any): Promise<void> {
  const payment = payload.payment.entity;

  console.log("[Webhook Handler] Processing payment.failed:", {
    paymentId: payment.id,
    orderId: payment.order_id,
    errorCode: payment.error_code,
    errorDescription: payment.error_description,
  });

  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client");
  }

  // Find the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", payment.order_id)
    .single();

  if (orderError || !order) {
    throw new Error(`Order not found for payment: ${payment.id}`);
  }

  // Update payment status
  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status: "failed",
      method: payment.method,
      gateway_response: payment,
      failure_reason: payment.error_description || payment.error_code,
      failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_payment_id", payment.id);

  if (paymentUpdateError) {
    throw new Error(`Failed to update payment: ${paymentUpdateError.message}`);
  }

  // Update order status
  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      status: "failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (orderUpdateError) {
    throw new Error(`Failed to update order: ${orderUpdateError.message}`);
  }

  // Send failure notification to customer
  await sendEmailNotification({
    to: order.customer_email,
    subject: `Payment Failed - ${order.order_number}`,
    template: "payment-failed",
    data: {
      customerName: order.customer_name || "Valued Customer",
      orderNumber: order.order_number,
      serviceName: order.service?.title || "Service",
      failureReason: payment.error_description || "Payment processing failed",
      retryLink: `${process.env.NEXTAUTH_URL}/offerings/${order.service?.slug || order.service_id}`,
    },
  });
}

// Handle order paid event
export async function handleOrderPaid(payload: any): Promise<void> {
  const order = payload.order.entity;

  console.log("[Webhook Handler] Processing order.paid:", {
    orderId: order.id,
    amount: order.amount,
    status: order.status,
  });

  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client");
  }

  // Find the order in our database
  const { data: dbOrder, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", order.id)
    .single();

  if (orderError || !dbOrder) {
    console.warn(`Order not found in database: ${order.id}`);
    return;
  }

  // Update order status if not already paid
  if (dbOrder.status !== "paid") {
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", dbOrder.id);

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    // Fulfill the order (with error handling)
    try {
      await fulfillOrder(dbOrder.id);
    } catch (fulfillmentError) {
      console.error(
        "[Webhook Handler] Order fulfillment failed:",
        fulfillmentError,
      );
      // Don't throw error here as the payment was already processed successfully
    }
  }
}

// Retry failed webhook processing
export async function retryFailedWebhooks(): Promise<void> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client");
  }

  // Get failed webhooks from the last 24 hours
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: failedWebhooks, error } = await supabase
    .from("payment_webhooks")
    .select("*")
    .eq("processed", false)
    .gte("created_at", twentyFourHoursAgo)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error || !failedWebhooks) {
    console.error("Failed to fetch failed webhooks:", error);
    return;
  }

  console.log(
    `[Webhook Retry] Processing ${failedWebhooks.length} failed webhooks`,
  );

  for (const webhook of failedWebhooks) {
    try {
      // Process webhook based on event type
      switch (webhook.event_type) {
        case "payment.captured":
          await handlePaymentCaptured(webhook.payload.payload);
          break;
        case "payment.failed":
          await handlePaymentFailed(webhook.payload.payload);
          break;
        case "order.paid":
          await handleOrderPaid(webhook.payload.payload);
          break;
        default:
          console.log(
            `[Webhook Retry] Unhandled event type: ${webhook.event_type}`,
          );
          continue;
      }

      // Mark as processed
      await supabase
        .from("payment_webhooks")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", webhook.id);

      console.log(
        `[Webhook Retry] Successfully processed webhook: ${webhook.id}`,
      );
    } catch (error) {
      console.error(
        `[Webhook Retry] Failed to process webhook ${webhook.id}:`,
        error,
      );

      // Update error message
      await supabase
        .from("payment_webhooks")
        .update({
          error_message:
            error instanceof Error ? error.message : "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", webhook.id);
    }
  }
}
