import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceRoleClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    // Get the service role client to bypass RLS
    const serviceRoleSupabase = await createServiceRoleClient();
    if (!serviceRoleSupabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized" },
        { status: 500 },
      );
    }

    // Get the user's data from the database to verify provider
    const { data: userData, error: userError } = await serviceRoleSupabase
      .from("users")
      .select("id, email, provider, provider_id, image")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify this is a Google account
    if (userData.provider !== "google") {
      return NextResponse.json(
        { error: "This operation is only available for Google accounts" },
        { status: 400 },
      );
    }

    // Get the user's Google profile picture
    // First try to get it from the session
    let googlePicture = (user as any).image;

    // If not available in session, try to get it from the users table
    if (!googlePicture) {
      googlePicture = userData.image;
    }

    // If still not available, return an error
    if (!googlePicture) {
      return NextResponse.json(
        { error: "Google profile picture not found" },
        { status: 404 },
      );
    }

    console.log(
      "Resetting profile picture to Google picture:",
      googlePicture.substring(0, 100) + "...",
    );

    // Update the user's profile picture in the database
    const { error: updateError } = await serviceRoleSupabase
      .from("users")
      .update({
        picture: googlePicture,
        custom_picture: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user profile picture:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile picture" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile picture reset to Google profile picture",
      picture: googlePicture,
    });
  } catch (error) {
    console.error("Error in reset-profile-picture API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
