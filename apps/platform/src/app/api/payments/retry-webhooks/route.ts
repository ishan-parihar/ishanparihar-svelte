import { NextRequest, NextResponse } from "next/server";
import { retryFailedWebhooks } from "@/lib/webhook-handlers";

// This endpoint can be called by a cron job to retry failed webhook processing
// You can set up a cron job in Vercel or use GitHub Actions to call this endpoint periodically

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (optional)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.WEBHOOK_RETRY_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Webhook Retry] Starting failed webhook retry process");

    await retryFailedWebhooks();

    console.log("[Webhook Retry] Failed webhook retry process completed");

    return NextResponse.json({
      success: true,
      message: "Failed webhooks retry process completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Webhook Retry] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Handle GET requests for manual triggering (development only)
export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Not available in production" },
        { status: 403 },
      );
    }

    console.log("[Webhook Retry] Manual retry triggered");

    await retryFailedWebhooks();

    return NextResponse.json({
      success: true,
      message: "Manual webhook retry completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Webhook Retry] Manual retry error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
