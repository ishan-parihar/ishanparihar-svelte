"use client";

import Image from "next/image";
import Link from "next/link";
// Import components
// Lazy load heavy components to reduce initial bundle size
const CommentSection = dynamic(
  () =>
    import("@/components/blog/comments/CommentSection").then((mod) => ({
      default: mod.CommentSection,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-64 rounded-none" />
    ),
    ssr: false, // Comments are client-side only
  },
);

const AnimatedBlogCard = dynamic(
  () =>
    import("@/components/optimized/OptimizedBlogCard").then((mod) => ({
      default: mod.OptimizedBlogCard,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-48 rounded-none" />
    ),
    ssr: true,
  },
);

// Dynamic import for MagicBento component with lazy loading
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-muted rounded-xl" />,
});

// Use CSS animations instead of framer-motion for critical path
import { Button } from "@/components/ui/button";
import { serializeMDX } from "@/lib/mdx";
import { extractHeadings } from "@/lib/mdx";
import { useEffect, useState, useRef } from "react";
import "@/app/blog/[slug]/blog-post-layout.css";
import "@/app/blog/[slug]/blog-post-features.css";
import "@/app/blog/[slug]/blog-post-mobile.css";
import "@/app/blog/mdx-clean.css";
// TOC fix is implemented directly in this component
// Import TTS player and text utilities
import dynamic from "next/dynamic";
import {
  extractPlainTextFromMDX,
  truncateToCompleteSentence,
} from "@/lib/text-utils";
import { PremiumContentGuard } from "@/components/blog/PremiumContentGuard";
import { AnimatedSection } from "@/components/motion";
import { LikeButton } from "@/components/blog/LikeButton";
import { EngagementMetrics } from "@/components/blog/EngagementMetrics";

// Dynamic import for BookmarkButton to isolate framer-motion from main bundle
const DynamicBookmarkButton = dynamic(
  () =>
    import("@/components/blog/BookmarkButton").then((mod) => ({
      default: mod.BookmarkButton,
    })),
  { ssr: false },
);

// Lazy load heavy components to reduce initial bundle size
const NativeTTSPlayer = dynamic(
  () =>
    import("@/components/tts/NativeTTSPlayer").then((mod) => ({
      default: mod.NativeTTSPlayer,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-none flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading audio player...</span>
      </div>
    ),
    ssr: false, // TTS is client-side only
  },
);

// MDX content renderer with image viewer support - lazy loaded to reduce bundle size
const MdxRenderer = dynamic(() => import("@/components/blog/MdxRenderer"), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
    </div>
  ),
  ssr: false, // Client-side only to reduce initial bundle
});

// Optimized table of contents with intersection observer
const TableOfContents = dynamic(
  () =>
    import("@/components/blog/TableOfContents").then((mod) => ({
      default: mod.TableOfContents,
    })),
  {
    loading: () => (
      <div className="animate-pulse space-y-2 p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 ml-4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 ml-4"></div>
      </div>
    ),
    ssr: false, // Client-side only for interactivity
  },
);

// Lazy load social share - not critical for initial render
const SocialShareServer = dynamic(
  () =>
    import("@/components/social-share-server").then((mod) => ({
      default: mod.SocialShareServer,
    })),
  {
    loading: () => (
      <div className="animate-pulse space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    ),
    ssr: false, // Social sharing is client-side
  },
);

// Lazy load reading progress - not critical for initial render
const ReadingProgressServer = dynamic(
  () =>
    import("@/components/reading-progress-server").then((mod) => ({
      default: mod.ReadingProgressServer,
    })),
  {
    loading: () => null,
    ssr: false, // Progress tracking is client-side only
  },
);

// Lazy load mobile bottom bar - not critical for initial render
const MobileBottomBarServer = dynamic(
  () => import("@/components/blog/MobileBottomBarServer"),
  {
    loading: () => null,
    ssr: false, // Mobile interactions are client-side
  },
);

// Lazy load blog author component
const BlogAuthorServer = dynamic(
  () =>
    import("@/components/blog-author-server").then((mod) => ({
      default: mod.BlogAuthorServer,
    })),
  {
    loading: () => (
      <div className="animate-pulse flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    ),
    ssr: true, // Keep SSR for SEO
  },
);

import { getOptimizedSupabaseClient } from "@/utils/supabase/optimized-client";
import { useBlogPostBySlugWithHelpers } from "@/queries/blogQueries";

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    scrollTimeout: number;
    sidebarOffsetParentLogged?: boolean;
  }
}

interface AuthorDetails {
  id: string;
  display_name: string;
  profile_picture_url: string | null;
  role: string;
}

interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  cover_image?: string; // Support both property naming conventions
  date: string;
  author: string;
  author_details?: AuthorDetails | null; // Added author details
  category: string;
  featured: boolean;
  content: string;
  serializedContent?: any; // Serialized MDX content
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
  // Engagement metrics (optional, populated when needed)
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
}

// Helper function to get blog cover image URL with simple URL pattern fixing
const getBlogImage = (post: BlogPost): string => {
  // Check if post is undefined or null
  if (!post) {
    console.error(
      "🖼️ BLOG COVER - getBlogImage called with undefined or null post",
    );
    return "/default-blog-image.jpg";
  }

  // Prioritize cover_image first as it's the format stored in Supabase,
  // then fallback to coverImage if it exists, otherwise use default
  let imageUrl =
    post.cover_image || post.coverImage || "/default-blog-image.jpg";

  // Validate URL before returning
  try {
    // Check if it's already a valid URL or a relative path
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
      // FALLBACK FIX: Fix problematic URL patterns directly in the component
      // This is only a fallback in case the server-side fix in getImagePublicUrl didn't catch all cases
      if (imageUrl.includes("/blog-images/blog/public/")) {
        const fixedUrl = imageUrl.replace(
          "/blog-images/blog/public/",
          "/blog-images/public/",
        );
        imageUrl = fixedUrl;
      } else if (imageUrl.includes("/blog-images/blog/")) {
        const fixedUrl = imageUrl.replace(
          "/blog-images/blog/",
          "/blog-images/",
        );
        imageUrl = fixedUrl;
      }
      return imageUrl;
    } else {
      // If it's not a valid URL or relative path, use default image
      return "/default-blog-image.jpg";
    }
  } catch (error) {
    console.error(`Error processing image URL: "${imageUrl}"`, error);
    return "/default-blog-image.jpg";
  }
};

// Related Posts Sidebar Component

interface BlogPostClientProps {
  post: BlogPost;
  isPremium?: boolean;
  currentPostSlug?: string;
  category?: string;
}

export function BlogPostClient({
  post,
  isPremium = false,
  currentPostSlug,
  category,
}: BlogPostClientProps) {
  const articleRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const articleContentContainerRef = useRef<HTMLDivElement>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  // Track previous position to avoid needless re-renders
  const prevPosition = useRef({ mode: "", top: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [blogPost, setBlogPost] = useState<BlogPost>(post);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plainTextContent, setPlainTextContent] = useState<string>("");

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post.slug]);

  // Use React Query hook to fetch complete post data if content is missing
  const supabase = getOptimizedSupabaseClient();
  const shouldFetchPost = Boolean(
    post.slug && (!post.content || post.content.trim() === ""),
  );

  const {
    data: fetchedPost,
    isLoading: isFetchingPost,
    error: fetchError,
  } = useBlogPostBySlugWithHelpers(
    supabase,
    post.slug || "",
    shouldFetchPost, // Only enable query if we need to fetch
  );

  // Update post data when fetched post is available
  useEffect(() => {
    if (fetchedPost && shouldFetchPost) {
      console.log(
        `[BlogPostClient] Post content fetched via React Query for slug: ${post.slug}`,
      );
      setBlogPost((prevPost) => ({
        ...prevPost,
        content: fetchedPost.content || prevPost.content,
        excerpt: fetchedPost.excerpt || prevPost.excerpt,
        title: fetchedPost.title || prevPost.title,
        // Handle both coverImage and cover_image properties
        coverImage: fetchedPost.cover_image || prevPost.coverImage,
        cover_image: fetchedPost.cover_image || prevPost.cover_image,
        author:
          typeof fetchedPost.author === "string"
            ? fetchedPost.author
            : typeof fetchedPost.author === "object" &&
                fetchedPost.author &&
                "name" in fetchedPost.author
              ? (fetchedPost.author as any).name
              : prevPost.author,
        category: fetchedPost.category || prevPost.category,
        // Include engagement metrics if available
        likes_count: fetchedPost.likes_count || prevPost.likes_count,
        comments_count: fetchedPost.comments_count || prevPost.comments_count,
        views_count: fetchedPost.views_count || prevPost.views_count,
      }));
    }
  }, [fetchedPost, shouldFetchPost, post.slug]);

  // Combine loading states and errors
  const combinedIsLoading = isLoading || isFetchingPost;
  const combinedError =
    error || (fetchError ? "Failed to load post content" : null);

  // Optimized MDX content serialization with debouncing
  useEffect(() => {
    if (blogPost.content && !blogPost.serializedContent) {
      // Debounce serialization to avoid blocking the main thread
      const timeoutId = setTimeout(async () => {
        try {
          // Use client-side serialization only as fallback
          // Server should pre-compile MDX content for better performance
          const serialized = await serializeMDX(blogPost.content);
          setBlogPost((prev) => ({
            ...prev,
            serializedContent: serialized,
          }));
        } catch (err) {
          console.error("Error serializing MDX content:", err);
          // Fallback to plain text if MDX fails
          setBlogPost((prev) => ({
            ...prev,
            serializedContent: null,
          }));
        }
      }, 100); // Small delay to prevent blocking

      return () => clearTimeout(timeoutId);
    }
  }, [blogPost.content, blogPost.serializedContent, post]);

  // MDX content is now rendered without toggleable headings

  // Extract headings from content for the Table of Contents
  const [headings, setHeadings] = useState<
    Array<{ text: string; displayText?: string; slug: string; level: number }>
  >([]);

  // Enhanced heading extraction from rendered DOM
  useEffect(() => {
    // Wait for MDX content to be rendered before extracting headings
    const extractHeadingsFromDOM = () => {
      if (!articleRef.current) return;

      // Focus on h2 and h3 headings as specified in requirements
      const headingElements = articleRef.current.querySelectorAll("h2, h3");
      const extractedHeadings: Array<{
        text: string;
        displayText?: string;
        slug: string;
        level: number;
      }> = [];

      headingElements.forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        const level = parseInt(tagName.charAt(1)); // Extract number from h1, h2, etc.
        const text = element.textContent || "";

        // Generate URL-friendly ID if not already present
        let slug = element.id;
        if (!slug && text) {
          // Create slug from text content
          slug = text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // Remove special characters
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single
            .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

          // Assign the generated ID to the element
          element.id = slug;
        }

        if (text && slug) {
          extractedHeadings.push({
            text,
            displayText: text,
            slug,
            level,
          });
        }
      });

      setHeadings(extractedHeadings);
    };

    // Extract headings after a short delay to ensure MDX content is rendered
    const timeoutId = setTimeout(() => {
      extractHeadingsFromDOM();

      // Fallback: if no headings found from DOM, use the original method
      if (headings.length === 0 && blogPost.content) {
        const fallbackHeadings = extractHeadings(blogPost.content);
        setHeadings(fallbackHeadings);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    blogPost.serializedContent,
    post?.serializedContent,
    blogPost.content,
    headings.length,
  ]);

  // Extract plain text from MDX content for TTS
  useEffect(() => {
    if (blogPost.content) {
      // Log the original content length for debugging
      console.log(
        `[BlogPost] Original MDX content length: ${blogPost.content.length} characters`,
      );

      // Extract plain text from MDX content
      const extractedText = extractPlainTextFromMDX(blogPost.content);
      console.log(
        `[BlogPost] Extracted plain text length: ${extractedText.length} characters`,
      );

      // Increase the character limit to ensure we get the full article
      // 30,000 characters is approximately 5,000-6,000 words, which should be enough for most articles
      const truncatedText = truncateToCompleteSentence(extractedText, 30000);
      console.log(
        `[BlogPost] Final truncated text length for TTS: ${truncatedText.length} characters`,
      );

      // Count words for duration estimation verification
      const wordCount = truncatedText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      console.log(`[BlogPost] Word count for TTS: ${wordCount} words`);

      setPlainTextContent(truncatedText);
    }
  }, [blogPost.content]);

  // Optimized scroll handler with throttling for better performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Format the date for display
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Show loading state
  if (combinedIsLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </main>
    );
  }

  // Show error state if there's an error
  if (combinedError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive rounded-none p-6 max-w-2xl w-full text-center">
          <h2 className="text-2xl font-heading font-bold text-destructive mb-4">
            Error Loading Blog Post
          </h2>
          <p className="text-muted-foreground mb-6">{combinedError}</p>
          <p className="text-sm text-muted-foreground mb-4">
            This could be due to a temporary connection issue or a problem with
            the database.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <ReadingProgressServer />
      <MobileBottomBarServer title={blogPost.title} slug={blogPost.slug} />
      <main className="pt-0 pb-8 md:pb-12 relative">
        {/* Hero Section - Cover image with improved 3:1 aspect ratio for better UX */}
        <section className="relative">
          <div className="relative aspect-[3/1] w-full overflow-hidden">
            {/* Optimized image with reduced parallax effect */}
            <div
              className="absolute inset-0 transform-gpu origin-center"
              style={{
                transform: `scale(${1.05 + scrollY * 0.0002}) translateY(${scrollY * 0.1}px)`,
                transition: "transform 0.1s ease-out",
                willChange: "transform",
              }}
            >
              {(() => {
                const imageSrc = getBlogImage(blogPost);
                return (
                  <Image
                    src={imageSrc}
                    alt={blogPost.title || ""}
                    fill
                    className="object-cover object-center transition-all duration-700"
                    priority
                    sizes="100vw"
                    quality={90}
                    style={{ objectPosition: "center center" }}
                    onError={(e) => {
                      console.error(`Image loading error for:`, imageSrc);
                    }}
                  />
                );
              })()}
            </div>

            {/* Subtle gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-black/20" />
          </div>

          {/* Hero card positioned below the cover image with improved spacing */}
          <div className="w-full mx-auto px-4 relative z-20 mt-8 sm:mt-12">
            <MagicBento
              cards={[
                {
                  id: "blog-hero",
                  content: (
                    <div className="p-8 md:p-12 relative">
                      <AnimatedSection delay={0.2}>
                        {/* Title and description with improved typography and centering */}
                        <div className="mb-8 text-center">
                          <h1 className="blog-card-title text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight mb-4">
                            {blogPost.title}
                          </h1>
                          <p className="blog-card-description text-lg md:text-xl leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {blogPost.excerpt}
                          </p>
                        </div>
                      </AnimatedSection>

                      {/* Clean divider */}
                      <div className="blog-card-divider"></div>

                      <AnimatedSection delay={0.4}>
                        {/* Engagement metrics and meta tags in a clean layout */}
                        <div className="flex flex-col items-center justify-center gap-6 mt-6">
                          {/* Engagement metrics and meta tags row */}
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {/* Engagement Metrics */}
                            <div className="flex items-center gap-3">
                              <LikeButton
                                slug={blogPost.slug}
                                initialCount={blogPost.likes_count || 0}
                                className="flex-shrink-0"
                              />
                              <EngagementMetrics
                                slug={blogPost.slug}
                                initialLikesCount={blogPost.likes_count || 0}
                                initialCommentsCount={
                                  blogPost.comments_count || 0
                                }
                                initialViewsCount={blogPost.views_count || 0}
                                showLiking={false}
                                onCommentsClick={() => {
                                  const commentsSection =
                                    document.querySelector(".comments-section");
                                  if (commentsSection) {
                                    commentsSection.scrollIntoView({
                                      behavior: "smooth",
                                    });
                                  }
                                }}
                                className="text-xs"
                              />
                              {/* Bookmark Button */}
                              {blogPost.id && (
                                <DynamicBookmarkButton
                                  postId={blogPost.id}
                                  postTitle={blogPost.title}
                                  size="sm"
                                  className="flex-shrink-0"
                                />
                              )}
                            </div>

                            {/* Meta tags in a clean row */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-1.5 text-xs font-ui font-medium rounded-none border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                                {blogPost.category}
                              </span>
                              {blogPost.content_type === "research_paper" && (
                                <span className="px-3 py-1.5 text-xs font-ui font-medium rounded-none border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                                  RESEARCH
                                </span>
                              )}
                              <span className="px-3 py-1.5 text-xs font-ui font-medium rounded-none border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                                {formattedDate}
                              </span>
                              <span className="px-3 py-1.5 text-xs font-ui font-medium rounded-none border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">
                                {Math.ceil(
                                  (blogPost.content?.split(" ").length || 0) /
                                    200,
                                ) || 5}{" "}
                                min read
                              </span>
                            </div>
                          </div>
                        </div>
                      </AnimatedSection>
                    </div>
                  ),
                },
              ]}
              className="w-full"
            />
          </div>
        </section>

        {/* Content Section */}
        <section className="py-4 md:py-8 relative">
          <div className="w-full mx-auto px-4">
            <div
              className="blog-layout blog-layout-sidebar-left relative"
              ref={articleContentContainerRef}
            >
              {/* Sidebar - moved before article for better document flow */}
              <div className="sidebar-container animate-fade-in">
                <div className="blog-sidebar" ref={sidebarRef}>
                  {/* Table of Contents */}
                  <div className="sidebar-card">
                    <TableOfContents headings={headings} />
                  </div>

                  {/* Social Share */}
                  <SocialShareServer
                    title={blogPost.title}
                    slug={blogPost.slug}
                  />
                </div>
              </div>

              {/* Main Content - with enhanced styling */}
              <div className="article-container" ref={articleRef}>
                <AnimatedSection delay={0.6}>
                  <div className="relative">
                    {/* Visual connector between hero and content - made transparent for LIME/MAGENTA test */}
                    <div className="absolute -top-8 left-0 w-1 h-8 bg-transparent rounded-full"></div>

                    {/* Text-to-Speech Player - only show for non-premium posts */}
                    {plainTextContent && !isPremium && (
                      <div className="mb-8">
                        <MagicBento
                          cards={[
                            {
                              id: "tts-player",
                              content: (
                                <NativeTTSPlayer
                                  textToSpeak={plainTextContent}
                                />
                              ),
                            },
                          ]}
                          className="w-full"
                        />
                      </div>
                    )}

                    <article className="prose dark:prose-invert prose-lg max-w-none">
                      <PremiumContentGuard
                        isPremium={isPremium}
                        postTitle={blogPost.title}
                        postSlug={blogPost.slug}
                        contentType="content-only"
                      >
                        {blogPost.serializedContent ? (
                          <MdxRenderer source={blogPost.serializedContent} />
                        ) : post?.serializedContent ? (
                          <MdxRenderer source={post.serializedContent} />
                        ) : blogPost.content ? (
                          <div className="space-y-4">
                            <div className="animate-pulse space-y-4">
                              <div className="h-6 bg-muted rounded w-3/4"></div>
                              <div className="h-4 bg-muted rounded w-full"></div>
                              <div className="h-4 bg-muted rounded w-5/6"></div>
                              <div className="h-4 bg-muted rounded w-4/5"></div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Loading content...
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">
                              No content available for this post.
                            </p>
                          </div>
                        )}
                      </PremiumContentGuard>
                    </article>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Comments Section placeholder - actual comments rendered in page component */}
        <div ref={commentsSectionRef}></div>

        {/* Control Panel is now in the sidebar */}
      </main>
    </>
  );
}
