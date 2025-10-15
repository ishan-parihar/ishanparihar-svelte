import { createServiceRoleClient } from "@/utils/supabase/server";
import type { Session } from "next-auth";

/**
 * Sync Google profile picture from session to database
 * This function ensures Google users have their profile pictures stored in the database
 */
export async function syncGoogleProfilePicture(
  userId: string,
  sessionImage?: string | null,
  userProvider?: string | null,
): Promise<{ success: boolean; updated: boolean; error?: string }> {
  try {
    // Only process Google users
    if (userProvider !== "google") {
      return { success: true, updated: false };
    }

    if (!sessionImage) {
      console.log(
        `[syncGoogleProfilePicture] No session image available for user ${userId}`,
      );
      return { success: true, updated: false };
    }

    const supabase = createServiceRoleClient();

    // Check current user data
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("id, picture, provider, custom_picture")
      .eq("id", userId)
      .single();

    if (userError || !currentUser) {
      console.error(
        `[syncGoogleProfilePicture] Failed to fetch user ${userId}:`,
        userError,
      );
      return { success: false, updated: false, error: userError?.message };
    }

    // Only update if user is Google provider and doesn't have a picture or has a custom picture set to false
    if (
      currentUser.provider === "google" &&
      (!currentUser.picture || currentUser.custom_picture === false)
    ) {
      console.log(
        `[syncGoogleProfilePicture] Syncing Google profile picture for user ${userId}`,
      );

      const { error: updateError } = await supabase
        .from("users")
        .update({
          picture: sessionImage,
          custom_picture: false, // Ensure this is marked as not custom
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error(
          `[syncGoogleProfilePicture] Failed to update user ${userId}:`,
          updateError,
        );
        return { success: false, updated: false, error: updateError.message };
      }

      console.log(
        `[syncGoogleProfilePicture] Successfully synced Google profile picture for user ${userId}`,
      );
      return { success: true, updated: true };
    }

    return { success: true, updated: false };
  } catch (error) {
    console.error(
      `[syncGoogleProfilePicture] Exception for user ${userId}:`,
      error,
    );
    return {
      success: false,
      updated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sync Google profile picture from NextAuth session
 */
export async function syncGoogleProfilePictureFromSession(
  session: Session | null,
): Promise<{ success: boolean; updated: boolean; error?: string }> {
  if (!session?.user?.id) {
    return { success: true, updated: false };
  }

  return syncGoogleProfilePicture(
    session.user.id,
    session.user.image,
    (session.user as any).provider,
  );
}

/**
 * Batch sync Google profile pictures for multiple users
 * Useful for fixing existing users with missing profile pictures
 */
export async function batchSyncGoogleProfilePictures(): Promise<{
  success: boolean;
  processed: number;
  updated: number;
  errors: string[];
}> {
  try {
    const supabase = createServiceRoleClient();

    // Get all Google users with missing pictures
    const { data: googleUsers, error: fetchError } = await supabase
      .from("users")
      .select("id, email, picture, provider, custom_picture")
      .eq("provider", "google")
      .is("picture", null);

    if (fetchError) {
      console.error(
        "[batchSyncGoogleProfilePictures] Failed to fetch Google users:",
        fetchError,
      );
      return {
        success: false,
        processed: 0,
        updated: 0,
        errors: [fetchError.message],
      };
    }

    if (!googleUsers || googleUsers.length === 0) {
      console.log(
        "[batchSyncGoogleProfilePictures] No Google users with missing pictures found",
      );
      return { success: true, processed: 0, updated: 0, errors: [] };
    }

    console.log(
      `[batchSyncGoogleProfilePictures] Found ${googleUsers.length} Google users with missing pictures`,
    );

    let processed = 0;
    let updated = 0;
    const errors: string[] = [];

    // Note: For batch processing, we would need to get the profile pictures from Google's API
    // or from stored session data. For now, we'll just log the users that need fixing.
    for (const user of googleUsers) {
      processed++;
      console.log(
        `[batchSyncGoogleProfilePictures] User ${user.id} (${user.email}) needs profile picture sync`,
      );

      // TODO: Implement actual profile picture retrieval from Google API
      // This would require storing OAuth tokens or making API calls to Google
    }

    return { success: true, processed, updated, errors };
  } catch (error) {
    console.error("[batchSyncGoogleProfilePictures] Exception:", error);
    return {
      success: false,
      processed: 0,
      updated: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
