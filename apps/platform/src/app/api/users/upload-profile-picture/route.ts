import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createRouteHandlerClient,
  createServiceRoleClient,
} from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ensureBucketExistsServer } from "@/lib/imageService";

// Common headers for all responses
const commonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication using the auth() function
    const session = await auth();

    if (!session || !session.user) {
      console.error("No authenticated session found");
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: commonHeaders,
        },
      );
    }

    console.log("Session found:", {
      type: (session.user as any).role === "admin" ? "admin" : "user",
      email: session.user.email,
      id: (session.user as any).id || (session.user as any).sub,
    });

    // Extract user ID from session - cast to any to access id property
    // The id property might not be directly accessible on the user object
    console.log("Session user:", session.user);

    // Try to extract user ID from various possible locations
    // First check custom headers (these are added by the client for debugging)
    const userIdHeader = request.headers.get("X-User-ID");
    const userEmailHeader = request.headers.get("X-User-Email");

    if (userIdHeader && userEmailHeader) {
      console.log(
        "Found user ID and email in headers:",
        userIdHeader,
        userEmailHeader,
      );
    }

    let userId =
      (session.user as any).id ||
      (session.user as any).sub ||
      (session.user as any).userId ||
      userIdHeader;

    // If we still don't have a user ID, try to find the user by email
    const userEmail = session.user.email || userEmailHeader;
    if (!userId && userEmail) {
      console.log(
        "User ID not found in session, trying to find by email:",
        userEmail,
      );

      // Get the Supabase client
      const supabase = await createRouteHandlerClient();

      // Try to find the user by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError || !userData) {
        console.error("Error finding user by email:", userError);
        return NextResponse.json(
          { error: "User not found by email" },
          {
            status: 401,
            headers: commonHeaders,
          },
        );
      }

      userId = userData.id;
      console.log("Found user ID by email:", userId);
    }

    const user = {
      id: userId,
      email: userEmail || session.user.email,
    };

    if (!user.id) {
      console.error(
        "User ID not found in session or by email lookup:",
        session.user,
      );
      return NextResponse.json(
        { error: "User ID not found" },
        {
          status: 401,
          headers: commonHeaders,
        },
      );
    }

    console.log("Authenticated user:", { id: user.id, email: user.email });

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        {
          status: 400,
          headers: commonHeaders,
        },
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        {
          status: 400,
          headers: commonHeaders,
        },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        {
          status: 400,
          headers: commonHeaders,
        },
      );
    }

    // Get the Supabase client
    const supabase = await createRouteHandlerClient();

    // Ensure the user-uploads bucket exists with correct permissions
    try {
      // First try the standard bucket check
      const bucketExists = await ensureBucketExistsServer("user-uploads");

      // If that fails, try to update the bucket policy directly
      if (!bucketExists) {
        console.log(
          "Standard bucket check failed, trying to update bucket policy directly",
        );

        // Call the update-bucket-policy API
        const policyResponse = await fetch(
          new URL("/api/storage/update-bucket-policy", request.url).toString(),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({ bucketName: "user-uploads" }),
          },
        );

        if (!policyResponse.ok) {
          const policyError = await policyResponse.json();
          console.error("Error updating bucket policy:", policyError);
          return NextResponse.json(
            { error: "Failed to update bucket policy" },
            {
              status: 500,
              headers: commonHeaders,
            },
          );
        }

        console.log("Successfully updated bucket policy");
      }
    } catch (bucketError) {
      console.error("Error ensuring bucket exists:", bucketError);
      return NextResponse.json(
        { error: "Failed to ensure user-uploads bucket exists" },
        {
          status: 500,
          headers: commonHeaders,
        },
      );
    }

    // Create a consistent filename based on user ID (without UUID)
    // Add a timestamp to ensure the browser doesn't cache the old image
    const fileExtension = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const fileName = `profile-${user.id}-${timestamp}.${fileExtension}`;
    const filePath = `profile-images/${fileName}`;

    // Get the service role client for the upload to bypass RLS
    const serviceRoleSupabase = createServiceRoleClient();

    console.log("Using service role client for upload to bypass RLS");

    // First, check if the user already has a profile picture in the database
    const { data: userPictureData, error: userDataError } =
      await serviceRoleSupabase
        .from("users")
        .select("picture, custom_picture")
        .eq("id", user.id)
        .single();

    if (
      !userDataError &&
      userPictureData &&
      userPictureData.custom_picture &&
      userPictureData.picture
    ) {
      console.log(
        "User has existing profile picture:",
        userPictureData.picture.substring(0, 100) + "...",
      );

      // Function to extract file path from Supabase URL
      const extractFilePathFromUrl = (url: string): string | null => {
        try {
          // Handle different URL formats
          let filePath: string | null = null;

          // Format 1: Standard Supabase URL
          if (url.includes("/storage/v1/object/public/")) {
            const match = url.match(
              /\/storage\/v1\/object\/public\/user-uploads\/(.+)/,
            );
            if (match && match[1]) {
              filePath = match[1];
            }
          }
          // Format 2: Direct URL with bucket name
          else if (url.includes("user-uploads")) {
            const parts = url.split("user-uploads/");
            if (parts.length > 1) {
              filePath = parts[1];
            }
          }

          // If we found a path, return it
          if (filePath) {
            // Remove any query parameters
            filePath = filePath.split("?")[0];
            return filePath;
          }

          return null;
        } catch (error) {
          console.error("Error extracting file path from URL:", error);
          return null;
        }
      };

      // Extract the old file path from the URL
      const oldFilePath = extractFilePathFromUrl(userPictureData.picture);

      if (oldFilePath) {
        console.log("Extracted file path for deletion:", oldFilePath);

        try {
          // Delete the old file
          const { error: deleteError, data: deleteData } =
            await serviceRoleSupabase.storage
              .from("user-uploads")
              .remove([oldFilePath]);

          if (deleteError) {
            console.warn("Failed to delete old profile picture:", deleteError);
            // Continue with upload even if delete fails
          } else {
            console.log(
              "Successfully deleted old profile picture:",
              deleteData,
            );
          }
        } catch (deleteError) {
          console.error("Exception during file deletion:", deleteError);
          // Continue with upload even if deletion throws an exception
        }
      } else {
        console.warn(
          "Could not extract file path from URL:",
          userPictureData.picture,
        );

        // Fallback: Try to delete using the user ID-based filename pattern
        try {
          // Try to delete any files that might match the pattern for this user
          const oldFilePattern = `profile-images/profile-${user.id}`;
          console.log("Trying fallback deletion with pattern:", oldFilePattern);

          // List files in the profile-images directory
          const { data: fileList, error: listError } =
            await serviceRoleSupabase.storage
              .from("user-uploads")
              .list("profile-images");

          if (!listError && fileList) {
            // Find files that match our pattern
            const matchingFiles = fileList.filter((file: any) =>
              file.name.startsWith(`profile-${user.id}`),
            );

            if (matchingFiles.length > 0) {
              console.log(
                "Found matching files to delete:",
                matchingFiles.map((f: any) => f.name),
              );

              // Delete each matching file
              for (const file of matchingFiles) {
                const { error: deleteError } = await serviceRoleSupabase.storage
                  .from("user-uploads")
                  .remove([`profile-images/${file.name}`]);

                if (deleteError) {
                  console.warn(
                    `Failed to delete file ${file.name}:`,
                    deleteError,
                  );
                } else {
                  console.log(`Successfully deleted file ${file.name}`);
                }
              }
            } else {
              console.log(
                "No matching files found for pattern:",
                oldFilePattern,
              );
            }
          } else if (listError) {
            console.warn("Error listing files for deletion:", listError);
          }
        } catch (fallbackError) {
          console.error("Error in fallback deletion:", fallbackError);
        }
      }
    }

    // Upload the file to Supabase Storage using service role client
    console.log(`Uploading new profile picture to ${filePath}`);
    const { error, data } = await serviceRoleSupabase.storage
      .from("user-uploads")
      .upload(filePath, file, {
        cacheControl: "max-age=3600, no-cache, must-revalidate",
        contentType: file.type, // Ensure correct content type
        upsert: true, // Overwrite if exists (though our filename should be unique with timestamp)
      });

    if (data) {
      console.log("Upload successful, file data:", data);
    }

    if (error) {
      console.error("Error uploading profile picture:", error);
      return NextResponse.json(
        { error: "Failed to upload profile picture" },
        {
          status: 500,
          headers: commonHeaders,
        },
      );
    }

    // Get the public URL of the uploaded file using service role client
    const {
      data: { publicUrl: originalPublicUrl },
    } = serviceRoleSupabase.storage.from("user-uploads").getPublicUrl(filePath);

    // Add a cache-busting parameter to ensure browsers don't show the old image
    const publicUrl = `${originalPublicUrl}?t=${timestamp}`;
    console.log("Generated public URL with cache busting:", publicUrl);

    // First, verify the user exists in the database with the given ID
    const userSupabase = await createRouteHandlerClient();

    // Verify the user exists and the session user is the same as the database user
    const { data: userData, error: userError } = await userSupabase
      .from("users")
      .select("id, email")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Error verifying user:", userError);
      return NextResponse.json(
        { error: "User not found or permission denied" },
        {
          status: 403,
          headers: commonHeaders,
        },
      );
    }

    // Verify the user is updating their own profile
    if (userData.email !== user.email) {
      console.error("Email mismatch:", userData.email, "vs", user.email);
      return NextResponse.json(
        { error: "Permission denied: You can only update your own profile" },
        {
          status: 403,
          headers: commonHeaders,
        },
      );
    }

    // We already have the service role client from above, no need to get it again

    const now = new Date().toISOString();
    const { error: updateError } = await serviceRoleSupabase
      .from("users")
      .update({
        picture: publicUrl,
        custom_picture: true,
        updated_at: now,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(
        "Error updating user profile with service role:",
        updateError,
      );

      // Try a direct update with the user's own client as a fallback
      console.log("Trying direct update with user's client as fallback");
      const { error: directUpdateError } = await userSupabase
        .from("users")
        .update({
          picture: publicUrl,
          custom_picture: true,
          updated_at: now,
        })
        .eq("id", user.id);

      if (directUpdateError) {
        console.error("Error with direct update fallback:", directUpdateError);
        return NextResponse.json(
          { error: "Failed to update profile" },
          {
            status: 500,
            headers: commonHeaders,
          },
        );
      }

      console.log("Direct update fallback succeeded");
    }

    // Return the public URL with headers
    return NextResponse.json(
      {
        success: true,
        fileUrl: publicUrl,
        message: "Profile picture updated successfully",
      },
      {
        headers: commonHeaders,
      },
    );
  } catch (error: any) {
    console.error("Error in upload-profile-picture API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      {
        status: 500,
        headers: commonHeaders,
      },
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: commonHeaders,
  });
}
