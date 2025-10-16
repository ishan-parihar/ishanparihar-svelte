import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

// Replicating the logic from getPublicBlogPosts in the original codebase
async function getPublicBlogPosts() {
    let query = supabase
        .from("blog_posts")
        .select(
            `
        id,
        slug,
        title,
        excerpt,
        cover_image,
        date,
        author,
        author_user_id,
        category,
        featured,
        created_at,
        updated_at,
        draft,
        premium,
        content_type,
        recommendation_tags,
        author:author_user_id(id, name, picture)
      `,
        )
        .eq("draft", false) // Only published posts
        .order("date", { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error("[SvelteKit] Error fetching public blog posts:", error);
        throw new Error(`Failed to fetch blog posts: ${error.message}`);
    }

    if (!data) {
        return [];
    }

    // Simplified transformation, will need to replicate engagement fetching later
    const transformedData = data.map((post: any) => {
        let authorName = "Anonymous";

        if (post.author && typeof post.author === "object") {
            authorName = post.author.name || "Anonymous";
        } else if (typeof post.author === "string") {
            authorName = post.author;
        }

        return {
            ...post,
            author: authorName,
        };
    });

    return transformedData;
}

export const load: PageServerLoad = async () => {
    const posts = await getPublicBlogPosts();
    return {
        posts,
    };
};