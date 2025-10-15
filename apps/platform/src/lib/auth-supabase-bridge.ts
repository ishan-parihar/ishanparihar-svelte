"use client";

import { createClient } from "@/utils/supabase/client";

/**
 * Creates a Supabase session from an Auth.js session.
 * This function should be called after a successful Auth.js login.
 *
 * @returns A promise that resolves to the result of the operation
 */
export async function createSupabaseSession() {
  try {
    console.log(
      "[AuthSupabaseBridge] Attempting to create Supabase session from Auth.js session",
    );

    // Call the API route to create a Supabase session
    const response = await fetch("/api/auth/supabase-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: include cookies
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "[AuthSupabaseBridge] Failed to create Supabase session:",
        errorData.error,
      );
      return {
        success: false,
        error: errorData.error || "Failed to create Supabase session",
      };
    }

    const result = await response.json();
    console.log("[AuthSupabaseBridge] API response received:", result);

    // Check if we received session tokens
    if (result.success && result.session) {
      console.log("[AuthSupabaseBridge] Session tokens received");

      // Get the Supabase client to set the session
      const supabase = createClient();

      console.log("[AuthSupabaseBridge] Setting Supabase session with tokens");

      // Add retry logic with exponential backoff
      const maxRetries = 3;
      let retries = 0;
      let sessionData;
      let sessionError;

      while (retries < maxRetries) {
        try {
          // Set the session with the tokens from the API
          const sessionResult = await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });

          sessionData = sessionResult.data;
          sessionError = sessionResult.error;

          if (!sessionError) {
            console.log(
              "[AuthSupabaseBridge] Supabase session set successfully on attempt",
              retries + 1,
            );
            break;
          }

          console.warn(
            `[AuthSupabaseBridge] Supabase setSession attempt ${retries + 1} failed:`,
            sessionError.message,
            `Retrying in ${1000 * Math.pow(2, retries)}ms...`,
          );
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries)));
          retries++;
        } catch (error) {
          console.error(
            `[AuthSupabaseBridge] Unexpected error on setSession attempt ${retries + 1}:`,
            error,
          );
          sessionError = new Error(
            error instanceof Error ? error.message : String(error),
          );
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries)));
          retries++;
        }
      }

      if (sessionError) {
        console.error(
          "[AuthSupabaseBridge] Failed to set Supabase session after",
          maxRetries,
          "retries:",
          sessionError,
        );
        return {
          success: false,
          error: `Failed to set Supabase session after ${maxRetries} retries: ${sessionError.message || String(sessionError)}`,
        };
      }
    }

    // Verify that we have a session
    try {
      // Get the Supabase client to verify the session
      const supabase = createClient();

      console.log("[AuthSupabaseBridge] Verifying Supabase session");

      // Check if we have a session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        console.log(
          "[AuthSupabaseBridge] Supabase session verified for user:",
          session.user.id,
        );
        return { success: true, user: session.user };
      } else if (result.session?.user) {
        // We have a user from the API but no session - try setting the session again with retry logic
        console.log(
          "[AuthSupabaseBridge] No session found but user returned from API, trying to set session again with retry",
        );

        const maxRetries = 2; // Fewer retries for the second attempt
        let retries = 0;
        let sessionData;
        let sessionError;

        while (retries < maxRetries) {
          try {
            const sessionResult = await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token,
            });

            sessionData = sessionResult.data;
            sessionError = sessionResult.error;

            if (!sessionError && sessionData.user) {
              console.log(
                "[AuthSupabaseBridge] Session set successfully on verification retry attempt",
                retries + 1,
              );
              return { success: true, user: sessionData.user };
            }

            console.warn(
              `[AuthSupabaseBridge] Verification retry attempt ${retries + 1} failed:`,
              sessionError?.message,
              `Retrying in ${1000 * Math.pow(2, retries)}ms...`,
            );
            await new Promise((r) =>
              setTimeout(r, 1000 * Math.pow(2, retries)),
            );
            retries++;
          } catch (error) {
            console.error(
              `[AuthSupabaseBridge] Unexpected error on verification retry attempt ${retries + 1}:`,
              error,
            );
            await new Promise((r) =>
              setTimeout(r, 1000 * Math.pow(2, retries)),
            );
            retries++;
          }
        }

        // If we still don't have a session, return the user from the API
        console.warn(
          "[AuthSupabaseBridge] Could not verify session after retries, falling back to API user data",
        );
        return { success: true, user: result.session.user };
      } else {
        console.error("[AuthSupabaseBridge] No session found after API call");
        return { success: false, error: "No session found after API call" };
      }
    } catch (error) {
      console.error("[AuthSupabaseBridge] Error verifying session:", error);
      return {
        success: false,
        error:
          "Error verifying session: " +
          (error instanceof Error ? error.message : String(error)),
      };
    }
  } catch (error) {
    console.error("[AuthSupabaseBridge] Unexpected error:", error);
    return {
      success: false,
      error:
        "Unexpected error creating Supabase session: " +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}

/**
 * Checks if there is an active Supabase session.
 *
 * @returns A promise that resolves to an object with the session status
 */
export async function checkSupabaseSession() {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      console.log(
        "[AuthSupabaseBridge] Active Supabase session found for user:",
        session.user.id,
      );
      return { hasSession: true, user: session.user };
    } else {
      console.log("[AuthSupabaseBridge] No active Supabase session found");
      return { hasSession: false };
    }
  } catch (error) {
    console.error(
      "[AuthSupabaseBridge] Error checking Supabase session:",
      error,
    );
    return { hasSession: false, error };
  }
}
