import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { PaymentWebhookInsert, PaymentUpdate } from "@/lib/supabase";
import {
  handlePaymentCaptured,
  handlePaymentFailed,
  handleOrderPaid,
} from "@/lib/webhook-handlers";

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] Webhook secret not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Webhook] Received RazorPay webhook");

    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("[Webhook] Missing signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(body, signature);
    if (!isValidSignature) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[Webhook] Signature verified successfully");

    // Parse webhook payload
    const payload = JSON.parse(body);
    const eventType = payload.event;

    console.log("[Webhook] Processing event:", {
      event: eventType,
      entity: payload.entity,
      accountId: payload.account_id,
    });

    // Initialize Supabase client
    const supabase = createServiceRoleClient();
    if (!supabase) {
      console.error("[Webhook] Failed to initialize Supabase client");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Store webhook event
    const webhookData: PaymentWebhookInsert = {
      event_type: eventType,
      razorpay_payment_id: payload.payload?.payment?.entity?.id || null,
      razorpay_order_id:
        payload.payload?.order?.entity?.id ||
        payload.payload?.payment?.entity?.order_id ||
        null,
      payload: payload,
      signature: signature,
      processed: false,
    };

    const { data: webhook, error: webhookError } = await supabase
      .from("payment_webhooks")
      .insert(webhookData)
      .select()
      .single();

    if (webhookError) {
      console.error("[Webhook] Failed to store webhook:", webhookError);
      return NextResponse.json(
        { error: "Failed to store webhook" },
        { status: 500 },
      );
    }

    // Process webhook based on event type
    try {
      switch (eventType) {
        case "payment.captured":
          await handlePaymentCaptured(payload.payload);
          break;

        case "payment.failed":
          await handlePaymentFailed(payload.payload);
          break;

        case "order.paid":
          await handleOrderPaid(payload.payload);
          break;

        default:
          console.log("[Webhook] Unhandled event type:", eventType);
          break;
      }

      // Mark webhook as processed
      await supabase
        .from("payment_webhooks")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", webhook.id);

      console.log("[Webhook] Event processed successfully:", eventType);
    } catch (processingError) {
      console.error("[Webhook] Error processing event:", processingError);

      // Mark webhook as failed
      await supabase
        .from("payment_webhooks")
        .update({
          processed: false,
          error_message:
            processingError instanceof Error
              ? processingError.message
              : "Unknown processing error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", webhook.id);

      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handle GET requests for webhook status (for debugging)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const eventType = searchParams.get("eventType");

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    let query = supabase
      .from("payment_webhooks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (eventType) {
      query = query.eq("event_type", eventType);
    }

    const { data: webhooks, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch webhooks" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      webhooks: webhooks || [],
    });
  } catch (error) {
    console.error("[Webhook] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
