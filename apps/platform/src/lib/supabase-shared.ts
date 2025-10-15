import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./supabase";
import { normalizeUrl } from "./supabase";
import { getImagePublicUrl } from "./imageService";

// Types for blog post
export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  cover_image_url_processed?: string; // Added for processed image URL
  date: string;
  author?: string; // Legacy field, kept for backward compatibility
  author_user_id: string; // Foreign key to users table
  category: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  draft?: boolean;
  premium?: boolean;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
  // Engagement metrics (optional, populated when needed)
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
};

// Type guard to check if an object is a valid BlogPost
export function isBlogPost(obj: any): obj is BlogPost {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.slug === "string" &&
    typeof obj.title === "string" &&
    typeof obj.excerpt === "string" &&
    typeof obj.content === "string" &&
    typeof obj.date === "string" &&
    typeof obj.author_user_id === "string" && // Check for author_user_id instead of author
    typeof obj.category === "string" &&
    typeof obj.featured === "boolean"
  );
}

// The fixSupabaseImageUrl function has been removed.
// Use getImagePublicUrl from src/lib/image-utils.ts instead.

// Save a blog post - accepts a Supabase client as parameter
export async function saveBlogPost(
  supabase: SupabaseClient<Database>,
  post: BlogPost,
): Promise<boolean> {
  try {
    console.log("📦📦📦 [saveBlogPost] Received post data:", post);
    console.log("📦📦📦 [saveBlogPost] author_user_id:", post.author_user_id);

    // Check if post exists
    const { data: existingPost, error: checkError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", post.slug)
      .maybeSingle();

    if (checkError && !checkError.message.includes("No rows found")) {
      console.error("saveBlogPost check error:", checkError);
      return false;
    }

    if (existingPost) {
      // Update existing post
      console.log(
        "📦📦📦 [saveBlogPost] Updating existing post with ID:",
        existingPost.id,
      );
      console.log(
        "📦📦📦 [saveBlogPost] Update payload author_user_id:",
        post.author_user_id,
      );

      const updatePayload = {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        date: post.date,
        author: post.author || "Anonymous", // Ensure author field is always provided
        author_user_id: post.author_user_id, // Use author_user_id instead of author display name
        category: post.category,
        featured: post.featured,
        updated_at: new Date().toISOString(),
        // Include draft status if provided
        ...(post.draft !== undefined ? { draft: post.draft } : {}),
        // Include premium status if provided
        ...(post.premium !== undefined ? { premium: post.premium } : {}),
      };

      console.log("📦📦📦 [saveBlogPost] Full update payload:", updatePayload);

      const { error: updateError } = await supabase
        .from("blog_posts")
        .update(updatePayload)
        .eq("id", existingPost.id);

      if (updateError) {
        console.error("saveBlogPost update error:", updateError);
        return false;
      }
    } else {
      // Create new post
      const insertPayload = {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.cover_image,
        date: post.date,
        author: post.author || "Anonymous", // Ensure author field is always provided
        author_user_id: post.author_user_id, // Use author_user_id instead of author display name
        category: post.category,
        featured: post.featured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Include draft status if provided, default to true if not specified
        draft: post.draft !== undefined ? post.draft : true,
        // Include premium status if provided
        ...(post.premium !== undefined ? { premium: post.premium } : {}),
      };

      console.log("📦📦📦 [saveBlogPost] Full insert payload:", insertPayload);

      const { error: insertError } = await supabase
        .from("blog_posts")
        .insert(insertPayload);

      if (insertError) {
        console.error("saveBlogPost insert error:", insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`saveBlogPost exception:`, error);
    return false;
  }
}

// Get all categories - accepts a Supabase client as parameter
export async function getAllCategories(
  supabase: SupabaseClient<Database>,
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("category");

    if (error || !data) {
      return ["Personal Growth"];
    }

    // Extract unique categories
    const categoriesSet = new Set<string>(data.map((post) => post.category));

    // Always include 'All Categories' at the beginning
    const categories = ["All Categories", ...Array.from(categoriesSet)];

    return categories;
  } catch (error) {
    return ["Personal Growth"];
  }
}

// Get a blog post by slug - accepts a Supabase client as parameter
export async function getBlogPostBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
  includeDrafts: boolean = false,
): Promise<BlogPost | null> {
  try {
    console.log(
      `[Supabase] getBlogPostBySlug called for slug: "${slug}", includeDrafts: ${includeDrafts}`,
    );

    // Build the query with engagement data join
    let query = supabase
      .from("blog_posts")
      .select(
        `
        *,
        author:author_user_id(id, name, picture),
        blog_engagement(claps_count, comments_count, views_count)
      `,
      )
      .eq("slug", slug);

    // Only include published posts unless includeDrafts is true
    if (!includeDrafts) {
      query = query.eq("draft", false);
    }

    const { data: post, error } = await query.maybeSingle();

    if (error) {
      console.error(
        `[Supabase] Error fetching blog post with slug ${slug}:`,
        error,
      );
      return null;
    }

    if (!post) {
      console.log(`[Supabase] No post found with slug: "${slug}"`);
      return null;
    }

    console.log(
      `[Supabase] Successfully fetched post: "${post.title}" (ID: ${post.id})`,
    );

    // Process engagement data
    if (post.blog_engagement) {
      let engagement;
      if (
        Array.isArray(post.blog_engagement) &&
        post.blog_engagement.length > 0
      ) {
        // Array format from LEFT JOIN
        engagement = post.blog_engagement[0];
      } else if (
        typeof post.blog_engagement === "object" &&
        !Array.isArray(post.blog_engagement)
      ) {
        // Object format from INNER JOIN
        engagement = post.blog_engagement;
      }

      if (engagement) {
        post.claps_count = engagement.claps_count || 0;
        post.comments_count = engagement.comments_count || 0;
        post.views_count = engagement.views_count || 0;
      } else {
        // Set default values if no engagement data
        post.claps_count = 0;
        post.comments_count = 0;
        post.views_count = 0;
      }
    } else {
      // Set default values if no engagement data
      post.claps_count = 0;
      post.comments_count = 0;
      post.views_count = 0;
    }

    // Process cover image if present
    if (post.cover_image) {
      // Use our generalized utility to get the public URL
      const publicUrl = getImagePublicUrl(
        supabase,
        "blog-images",
        post.cover_image,
      );

      if (publicUrl) {
        post.cover_image = publicUrl;
      } else {
        console.warn(
          `Could not generate public URL for cover_image:`,
          post.cover_image,
        );
        // If we couldn't generate a URL, use a default image
        post.cover_image = "/default-blog-image.jpg";
      }
    }

    return post;
  } catch (error) {
    console.error(
      `[Supabase] Exception in getBlogPostBySlug for ${slug}:`,
      error,
    );
    return null;
  }
}
