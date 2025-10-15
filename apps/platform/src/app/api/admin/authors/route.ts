import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceRoleClient } from "@/utils/supabase/server";

/**
 * GET /api/admin/authors
 * Get all team members who can be authors (admin, editor, contributor roles)
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session using the auth() function
    const session = await auth();

    // Check if the user is authenticated
    if (!session?.user) {
      console.error(
        "Unauthorized access attempt to /api/admin/authors - No session",
      );
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    console.log("[Authors API] Initializing service role Supabase client");
    const supabase = await createServiceRoleClient();

    if (!supabase) {
      console.error(
        "[Authors API] Failed to initialize Supabase service role client",
      );
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Fetch all users who can be authors (admin role)
    console.log("[Authors API] Fetching admin users");
    const { data: authors, error } = await supabase
      .from("users")
      .select("id, email, name, picture, role")
      .eq("role", "admin")
      .order("name");

    if (error) {
      console.error("[Authors API] Error fetching authors:", error);
      return NextResponse.json(
        { error: "Failed to fetch authors", details: error.message },
        { status: 500 },
      );
    }

    console.log(
      `[Authors API] Successfully fetched ${authors?.length || 0} admin users`,
    );

    // Format the authors data to match the expected structure
    const formattedAuthors = (authors || []).map((author: any) => ({
      id: author.id,
      display_name: author.name || author.email.split("@")[0],
      profile_picture_url: author.picture || null,
      role: author.role,
      bio: null, // Not available in users table
    }));

    // Return the formatted authors
    return NextResponse.json({
      success: true,
      authors: formattedAuthors,
    });
  } catch (error) {
    console.error("[Authors API] Unexpected error in authors API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
