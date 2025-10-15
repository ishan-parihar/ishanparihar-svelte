import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createRouteHandlerClient,
  createServiceRoleClient,
} from "@/utils/supabase/server";

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
      .select("id, email, provider, provider_id, name, image, custom_picture")
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

    // Get the user's Google profile information
    const googleName = (user as any).name || userData.name;
    const googleImage = (user as any).image || userData.image;

    if (!googleName && !googleImage) {
      return NextResponse.json(
        { error: "No Google profile information found" },
        { status: 404 },
      );
    }

    // Update fields to update
    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that exist
    if (googleName) {
      updateFields.name = googleName;
    }

    if (googleImage) {
      updateFields.image = googleImage;

      // If not using a custom picture, also update the picture field
      if (!userData.custom_picture) {
        updateFields.picture = googleImage;
      }
    }

    console.log("Updating Google profile information:", updateFields);

    // Update the user's profile information in the database
    const { error: updateError } = await serviceRoleSupabase
      .from("users")
      .update(updateFields)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user profile information:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile information" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile information updated with Google data",
      name: googleName,
      image: googleImage,
    });
  } catch (error) {
    console.error("Error in update-google-info API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
