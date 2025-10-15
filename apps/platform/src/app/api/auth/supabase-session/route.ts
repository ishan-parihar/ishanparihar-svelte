import { NextRequest, NextResponse } from "next/server";
import {
  createRouteHandlerClient,
  createServiceRoleClient,
} from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";
import { handleUserRegistrationNewsletter } from "@/lib/newsletterService";

/**
 * This API route creates a Supabase session from an Auth.js session.
 * It should be called after a successful Auth.js login to establish a Supabase session.
 *
 * The route accepts a POST request and returns a JSON response with the result.
 */
export async function POST(request: NextRequest) {
  try {
    console.log(
      "[AuthSupabaseBridge] Attempting to create Supabase session from Auth.js session",
    );

    // Get the Auth.js token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      console.error("[AuthSupabaseBridge] No Auth.js token found");
      return NextResponse.json(
        { error: "No Auth.js session found" },
        { status: 401 },
      );
    }

    if (!token.email) {
      console.error(
        "[AuthSupabaseBridge] Auth.js token found but no email present",
      );
      return NextResponse.json(
        { error: "Auth.js session has no email" },
        { status: 400 },
      );
    }

    console.log(
      `[AuthSupabaseBridge] Auth.js token found for user: ${token.email}`,
    );

    // Create a Supabase client with cookies for session management
    const supabaseWithCookies = await createRouteHandlerClient();

    // Check if there's already a Supabase session
    const {
      data: { session: existingSession },
    } = await supabaseWithCookies.auth.getSession();

    if (existingSession) {
      console.log(
        `[AuthSupabaseBridge] Existing Supabase session found for user: ${existingSession.user.id}`,
      );
      return NextResponse.json(
        {
          success: true,
          message: "Existing Supabase session found",
          user: existingSession.user,
        },
        { status: 200 },
      );
    }

    // No existing session, so we need to create one
    // We'll use the service role client for admin operations
    const supabaseAdmin = await createServiceRoleClient();

    // 1. Check if the user already exists in Supabase by listing all users and filtering
    const { data: existingUsers, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error(
        "[AuthSupabaseBridge] Error listing Supabase users:",
        listError,
      );
      return NextResponse.json(
        { error: `Error checking existing users: ${listError.message}` },
        { status: 500 },
      );
    }

    let supabaseUserId: string | null = null;
    let userMetadata = {};

    // Add any user metadata from Auth.js token that we want to preserve
    if (token.name) {
      userMetadata = {
        ...userMetadata,
        full_name: token.name,
      };
    }
    if (token.picture) {
      userMetadata = {
        ...userMetadata,
        avatar_url: token.picture,
      };
    }

    // Find the user by email in the returned list
    const existingUser = existingUsers?.users.find(
      (user: any) =>
        user.email?.toLowerCase() === (token.email as string).toLowerCase(),
    );

    // If user exists, get their ID
    if (existingUser) {
      supabaseUserId = existingUser.id;
      console.log(
        `[AuthSupabaseBridge] User ${token.email} already exists in Supabase with ID: ${supabaseUserId}`,
      );

      // Update user metadata if needed
      if (Object.keys(userMetadata).length > 0) {
        const { error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
            user_metadata: userMetadata,
          });

        if (updateError) {
          console.warn(
            "[AuthSupabaseBridge] Error updating user metadata:",
            updateError,
          );
          // Non-fatal, continue
        }
      }
    } else {
      // User does not exist, create them
      console.log(
        `[AuthSupabaseBridge] User ${token.email} not found in Supabase. Creating...`,
      );

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: token.email as string,
          email_confirm: true, // Auto-confirm since Auth.js already verified the email
          user_metadata: userMetadata,
          app_metadata: { provider: "authjs" },
        });

      if (createError) {
        console.error(
          "[AuthSupabaseBridge] Error creating Supabase user:",
          createError,
        );
        return NextResponse.json(
          { error: `Database error creating user: ${createError.message}` },
          { status: 500 },
        );
      }

      if (!newUser || !newUser.user) {
        console.error(
          "[AuthSupabaseBridge] Failed to create user, newUser object is null or invalid",
        );
        return NextResponse.json(
          { error: "User creation failed, no user object returned" },
          { status: 500 },
        );
      }

      supabaseUserId = newUser.user.id;
      console.log(
        `[AuthSupabaseBridge] Successfully created Supabase user ${token.email} with ID: ${supabaseUserId}`,
      );

      // Handle newsletter subscription for new user
      try {
        await handleUserRegistrationNewsletter(
          token.email as string,
          (token.name as string) || (token.email as string).split("@")[0],
          supabaseUserId!,
        );
        console.log(
          `[AuthSupabaseBridge] Newsletter subscription handled for new user: ${token.email}`,
        );
      } catch (newsletterError) {
        console.error(
          "[AuthSupabaseBridge] Error handling newsletter subscription for new user:",
          newsletterError,
        );
        // Don't fail user creation if newsletter subscription fails
      }
    }

    if (!supabaseUserId) {
      console.error(
        "[AuthSupabaseBridge] Supabase User ID is null after check/create",
      );
      return NextResponse.json(
        { error: "Failed to obtain Supabase user ID" },
        { status: 500 },
      );
    }

    // 2. Create a custom JWT token for the user
    console.log(
      `[AuthSupabaseBridge] Creating custom JWT token for user ID: ${supabaseUserId}`,
    );

    try {
      // First, make sure the user's email is confirmed
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
          email_confirm: true,
          user_metadata: userMetadata,
          app_metadata: {
            provider: "authjs",
          },
        });

      if (updateError) {
        console.error(
          "[AuthSupabaseBridge] Error confirming user email:",
          updateError,
        );
        return NextResponse.json(
          { error: `Failed to confirm user email: ${updateError.message}` },
          { status: 500 },
        );
      }

      // Get the Supabase JWT secret
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;

      if (!jwtSecret) {
        console.error("[AuthSupabaseBridge] Missing SUPABASE_JWT_SECRET");
        return NextResponse.json(
          { error: "Server configuration error: Missing JWT secret" },
          { status: 500 },
        );
      }

      // Get the Supabase URL for the audience claim
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!supabaseUrl) {
        console.error("[AuthSupabaseBridge] Missing NEXT_PUBLIC_SUPABASE_URL");
        return NextResponse.json(
          { error: "Server configuration error: Missing Supabase URL" },
          { status: 500 },
        );
      }

      // Create the access token payload
      const now = Math.floor(Date.now() / 1000);
      const accessTokenExpiry = now + 3600; // 1 hour
      const refreshTokenExpiry = now + 86400 * 7; // 7 days

      const accessTokenPayload = {
        aud: "authenticated",
        exp: accessTokenExpiry,
        sub: supabaseUserId,
        email: token.email,
        role: "authenticated",
        iat: now,
      };

      // Create the refresh token payload
      const refreshTokenPayload = {
        aud: "authenticated",
        exp: refreshTokenExpiry,
        sub: supabaseUserId,
        role: "authenticated",
        iat: now,
        refresh_token: true,
      };

      // Sign the tokens using jose library for Edge runtime compatibility
      console.log("[AuthSupabaseBridge] Signing JWT tokens");

      const secret = new TextEncoder().encode(jwtSecret);

      const accessToken = await new SignJWT(accessTokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(accessTokenExpiry)
        .sign(secret);

      const refreshToken = await new SignJWT(refreshTokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(refreshTokenExpiry)
        .sign(secret);

      console.log("[AuthSupabaseBridge] JWT tokens created successfully");

      // Return the tokens to the client
      // Set the session using the route handler client
      const supabaseWithCookies = await createRouteHandlerClient();
      const { error: sessionError } = await supabaseWithCookies.auth.setSession(
        {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      );

      if (sessionError) {
        console.error(
          "[AuthSupabaseBridge] Error setting session:",
          sessionError,
        );
        return NextResponse.json(
          { error: `Failed to set session: ${sessionError.message}` },
          { status: 500 },
        );
      }

      console.log(
        "[AuthSupabaseBridge] Supabase session set successfully via setSession.",
      );

      // Return the tokens to the client
      return NextResponse.json(
        {
          success: true,
          message: "Supabase session created successfully",
          session: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600, // 1 hour in seconds
            user: {
              id: supabaseUserId,
              email: token.email,
            },
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("[AuthSupabaseBridge] Error in session creation:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("[AuthSupabaseBridge] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
