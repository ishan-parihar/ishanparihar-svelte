"use client";

import { HorizontalBlogCard } from "@/components/blog/HorizontalBlogCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import for MagicBento to prevent SSR issues
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  ssr: false,
  loading: () => <div className="space-y-6" />,
});

interface RelatedArticlesSectionProps {
  firstRowPosts: any[];
  secondRowPosts: any[];
  currentPostCategory: string;
}

export default function RelatedArticlesSection({
  firstRowPosts,
  secondRowPosts,
  currentPostCategory,
}: RelatedArticlesSectionProps) {
  return (
    <section
      id="blog-posts"
      className="py-16 md:py-24 bg-background relative"
      style={{ zIndex: 10, position: "relative" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 bg-transparent p-6 rounded-none border border-border/50">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Related Articles</h2>
            <p className="text-muted-foreground mt-2">
              {firstRowPosts.length > 0 || secondRowPosts.length > 0
                ? `Curated articles featuring both category-relevant and trending content`
                : "Discover more articles from our blog"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 text-xs font-medium rounded-none bg-transparent border border-foreground/40 text-foreground shadow-sm">
                {currentPostCategory}
              </span>
              {(firstRowPosts.length > 0 || secondRowPosts.length > 0) && (
                <span className="px-3 py-1.5 text-xs font-medium rounded-none bg-transparent border border-foreground/40 text-foreground shadow-sm">
                  {firstRowPosts.length + secondRowPosts.length} Articles
                </span>
              )}
            </div>
            <Link href="/blog">
              <Button size="sm" className="whitespace-nowrap">
                Browse All Articles
              </Button>
            </Link>
          </div>
        </div>

        {/* Seamless Two-Row Blog Posts Layout or Empty State */}
        {firstRowPosts.length > 0 || secondRowPosts.length > 0 ? (
          <div className="space-y-8">
            {/* First Row */}
            {firstRowPosts.length > 0 && (
              <MagicBento
                cards={firstRowPosts.map((relatedPost, index) => {
                  // Validate the related post before rendering
                  if (!relatedPost || !relatedPost.slug) {
                    console.error("Invalid related post:", relatedPost);
                    return null;
                  }

                  try {
                    return {
                      id: relatedPost.slug,
                      content: (
                        <HorizontalBlogCard
                          key={relatedPost.slug}
                          id={relatedPost.id}
                          title={relatedPost.title || "Untitled Post"}
                          excerpt={relatedPost.excerpt || ""}
                          coverImage={
                            relatedPost.coverImage || "/default-blog-image.jpg"
                          }
                          date={relatedPost.date || new Date().toISOString()}
                          category={relatedPost.category || "Uncategorized"}
                          slug={relatedPost.slug}
                          index={index}
                          likes_count={relatedPost.likes_count || 0}
                          comments_count={relatedPost.comments_count || 0}
                          views_count={relatedPost.views_count || 0}
                          content_type={relatedPost.content_type || "blog"}
                          recommendation_tags={
                            relatedPost.recommendation_tags || []
                          }
                        />
                      ),
                      className: "border-0", // Remove border since MagicBento handles styling
                    };
                  } catch (error) {
                    console.error(
                      `Error rendering related post card for ${relatedPost.slug}:`,
                      error,
                    );
                    return null;
                  }
                }).filter(Boolean)}
                className="space-y-0 divide-y divide-neutral-200/60 dark:divide-neutral-800/60"
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={true}
              />
            )}

            {/* Second Row */}
            {secondRowPosts.length > 0 && (
              <MagicBento
                cards={secondRowPosts.map((relatedPost, index) => {
                  // Validate the related post before rendering
                  if (!relatedPost || !relatedPost.slug) {
                    console.error("Invalid related post:", relatedPost);
                    return null;
                  }

                  try {
                    return {
                      id: relatedPost.slug,
                      content: (
                        <HorizontalBlogCard
                          key={relatedPost.slug}
                          id={relatedPost.id}
                          title={relatedPost.title || "Untitled Post"}
                          excerpt={relatedPost.excerpt || ""}
                          coverImage={
                            relatedPost.coverImage || "/default-blog-image.jpg"
                          }
                          date={relatedPost.date || new Date().toISOString()}
                          category={relatedPost.category || "Uncategorized"}
                          slug={relatedPost.slug}
                          index={index + firstRowPosts.length} // Continue index from first row
                          likes_count={relatedPost.likes_count || 0}
                          comments_count={relatedPost.comments_count || 0}
                          views_count={relatedPost.views_count || 0}
                          content_type={relatedPost.content_type || "blog"}
                          recommendation_tags={
                            relatedPost.recommendation_tags || []
                          }
                        />
                      ),
                      className: "border-0", // Remove border since MagicBento handles styling
                    };
                  } catch (error) {
                    console.error(
                      `Error rendering related post card for ${relatedPost.slug}:`,
                      error,
                    );
                    return null;
                  }
                }).filter(Boolean)}
                className="space-y-0 divide-y divide-neutral-200/60 dark:divide-neutral-800/60"
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={true}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm rounded-none">
            <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
              No Related Articles Found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We couldn't find any related articles at the moment. Check out our
              latest posts instead.
            </p>
            <Link href="/blog">
              <Button variant="outline" size="sm">
                Browse All Articles
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
