"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/trpc-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateSEOSlug } from "@/lib/slug-utils";

// Dynamically import the BlogPostForm component to reduce initial bundle size
const BlogPostForm = dynamic(
  () =>
    import("@/components/admin/blog-post-form").then((mod) => mod.BlogPostForm),
  {
    loading: () => (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-lg">Loading editor...</div>
      </div>
    ),
    ssr: false, // Disable SSR for the editor component
  },
);

// Define the BlogPost type for new posts
interface NewBlogPost {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  featured: boolean;
}

interface BlogNewClientProps {
  categories: string[];
}

export function BlogNewClient({ categories }: BlogNewClientProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  // tRPC mutation for creating blog posts
  const createPostMutation = api.blog.createPost.useMutation();

  // Create an empty post template
  const emptyPost: NewBlogPost = {
    title: "",
    excerpt: "",
    content: "",
    coverImage: "https://ext.same-assets.com/3349622857/2158580439.jpeg", // Default image
    category: categories[0] || "Personal Growth",
    featured: false,
  };

  const handleSave = async (formData: any) => {
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    // Generate a slug from the title using SEO-optimized function
    const slug = generateSEOSlug(formData.title);

    if (!slug) {
      setError("Could not generate a valid slug from the title");
      return;
    }

    // Prepare post data
    const postData = {
      slug: `${slug}-${Math.floor(Math.random() * 100000)}`, // Add random number to ensure uniqueness
      title: formData.title.trim(),
      excerpt: formData.excerpt?.trim() || "",
      content: formData.content,
      cover_image: formData.coverImage || "",
      date: new Date().toISOString().split("T")[0],
      author: "Ishan Parihar",
      author_user_id: "admin", // Required field for admin operations
      category: formData.category || "Uncategorized",
      featured: Boolean(formData.featured),
    };

    try {
      console.log("Creating new blog post:", postData);
      // Use tRPC mutation to create the blog post
      await createPostMutation.mutateAsync({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.coverImage,
        category: formData.category,
        featured: formData.featured,
        draft: formData.draft,
        premium: formData.premium,
        published_at: formData.date,
      });

      // Redirect to admin blog page on success
      // Cache updates are handled automatically by tRPC
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error saving blog post:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error saving post. Check browser console for details.",
      );
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Back to Posts</Link>
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-lg">Loading editor...</div>
          </div>
        }
      >
        <BlogPostForm
          initialData={emptyPost}
          categories={categories}
          onSubmit={handleSave}
        />
      </Suspense>
    </>
  );
}
