import { NextRequest, NextResponse } from "next/server";
import {
  sendAccountVerificationEmailServer,
  verifyUserEmailServer,
} from "@/lib/auth-newsletter-server";

/**
 * API route to send verification emails
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, name } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email required" },
        { status: 400 },
      );
    }

    // Send verification email
    const result = await sendAccountVerificationEmailServer(email, name);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to send verification email",
          error: result.error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent",
        // Include the token in development for testing
        token:
          process.env.NODE_ENV === "development" ? result.token : undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[API] Error in verify email endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process verification request" },
      { status: 500 },
    );
  }
}

/**
 * API route to verify email tokens
 */
export async function GET(request: NextRequest) {
  try {
    // Get the token from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/verify?error=missing-token", request.url),
      );
    }

    // Instead of verifying the email here, pass the token to the verify page
    // This allows the page to handle the verification and display the CompleteSignUpForm
    return NextResponse.redirect(
      new URL(`/auth/verify?token=${encodeURIComponent(token)}`, request.url),
    );
  } catch (error) {
    console.error("[API] Error in verify email endpoint:", error);
    return NextResponse.redirect(
      new URL("/auth/verify?error=server-error", request.url),
    );
  }
}
