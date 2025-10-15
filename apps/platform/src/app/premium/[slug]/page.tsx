import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { createServerClient } from "@/utils/supabase/server";
import { getBlogPostBySlug } from "@/queries/blogQueries";
import { AnimatedSection, StaggeredList } from "@/components/motion";

// This is a dynamic, server-rendered component - no static generation
// Access is protected by middleware, so we can safely fetch premium content

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return {
      title: "Premium Content Not Found | Ishan Parihar",
      description: "The requested premium content could not be found.",
    };
  }

  try {
    // Use authenticated server client to fetch metadata
    const supabase = await createServerClient();
    const post = await getBlogPostBySlug(supabase, slug);

    if (!post || !post.premium) {
      return {
        title: "Premium Content Not Found | Ishan Parihar",
        description: "The requested premium content could not be found.",
      };
    }

    return {
      title: `${post.title} | Premium Content | Ishan Parihar`,
      description: post.excerpt || "Exclusive premium content for members",
      robots: {
        index: false, // Don't index premium content
        follow: false,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for premium content:", error);
    return {
      title: "Premium Content Not Found | Ishan Parihar",
      description: "The requested premium content could not be found.",
    };
  }
}

export default async function PremiumPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  try {
    // Use authenticated server client - middleware has already verified access
    const supabase = await createServerClient();
    const post = await getBlogPostBySlug(supabase, slug);

    if (!post) {
      notFound();
    }

    // Verify this is actually premium content
    if (!post.premium) {
      // If it's not premium content, redirect to public blog
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">
              Content Available Publicly
            </h1>
            <p className="text-muted-foreground mb-6">
              This content is available on our public blog.
            </p>
            <Link
              href={`/blog/${slug}`}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              View Public Post
            </Link>
          </div>
        </div>
      );
    }

    // Render full premium content
    return (
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <AnimatedSection>
            <header className="mb-8">
              <div className="inline-flex items-center gap-2 text-sm text-yellow-600 font-medium mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Premium Content
              </div>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString()}
                </time>
                <span>•</span>
                <span>{post.category}</span>
              </div>
            </header>
          </AnimatedSection>

          {post.excerpt && (
            <AnimatedSection delay={0.2}>
              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <p className="text-lg text-muted-foreground">{post.excerpt}</p>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection delay={0.4}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <MDXRemote source={post.content} />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <footer className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  ← Back to Blog
                </Link>
                <div className="text-sm text-muted-foreground">
                  Thank you for being a premium member!
                </div>
              </div>
            </footer>
          </AnimatedSection>
        </article>
      </div>
    );
  } catch (error) {
    console.error("Error fetching premium blog post:", error);
    notFound();
  }
}
