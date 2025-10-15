import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceRoleClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      console.error("No authenticated session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the bucket name from the request
    const { bucketName } = await request.json();

    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 },
      );
    }

    // Get the service role Supabase client
    const supabase = await createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized" },
        { status: 500 },
      );
    }

    // First, check if the bucket exists
    try {
      const { data: bucketData, error: bucketError } =
        await supabase.storage.getBucket(bucketName);

      if (bucketError) {
        console.error(`Error getting bucket ${bucketName}:`, bucketError);

        // If the bucket doesn't exist, create it
        if (bucketError.message?.includes("not found")) {
          const { error: createError } = await supabase.storage.createBucket(
            bucketName,
            {
              public: true,
              fileSizeLimit: 5242880, // 5MB
            },
          );

          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
            return NextResponse.json(
              { error: `Failed to create bucket: ${createError.message}` },
              { status: 500 },
            );
          }

          console.log(`Successfully created bucket ${bucketName}`);
        } else {
          return NextResponse.json(
            { error: `Failed to get bucket: ${bucketError.message}` },
            { status: 500 },
          );
        }
      }
    } catch (error) {
      console.error(`Exception checking bucket ${bucketName}:`, error);
    }

    // Update the bucket policy to allow uploads
    try {
      const { error: updateError } = await supabase.storage.updateBucket(
        bucketName,
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        },
      );

      if (updateError) {
        console.error(`Error updating bucket ${bucketName}:`, updateError);
        return NextResponse.json(
          { error: `Failed to update bucket policy: ${updateError.message}` },
          { status: 500 },
        );
      }

      console.log(`Successfully updated bucket ${bucketName} policy`);
    } catch (error) {
      console.error(`Exception updating bucket ${bucketName} policy:`, error);
      return NextResponse.json(
        {
          error: `Exception updating bucket policy: ${error instanceof Error ? error.message : String(error)}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated bucket ${bucketName} policy`,
    });
  } catch (error) {
    console.error("Error in update-bucket-policy API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
