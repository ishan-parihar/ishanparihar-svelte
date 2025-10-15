"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import dynamic from "next/dynamic";
import { transformFeaturedArticlesToCardData } from "@/lib/data-adapter";
import { BlogCardSkeleton } from "@/components/ui/loading-animations";
import { HorizontalBlogCard } from "@/components/blog/HorizontalBlogCard";
import { FocusEnhancer } from "@/components/ui/focus-enhancer";
import { FeaturedHeroCard } from "@/components/blog/FeaturedHeroCard";
import { FeaturedSecondaryCard } from "@/components/blog/FeaturedSecondaryCard";

// Dynamic import for MagicBento to prevent SSR issues
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <BlogCardSkeleton />
        </motion.div>
      ))}
    </div>
  ),
});

interface FeaturedArticle {
  id?: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  cover_image?: string;
  date: string;
  category: string;
  slug: string;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  content_type?: "blog" | "research_paper";
  recommendation_tags?: string[];
  content?: string; // Optional for featured articles
  featured?: boolean; // Optional for featured articles
  premium?: boolean; // Premium content flag
}

interface FeaturedArticlesSectionProps {
  featuredPosts: FeaturedArticle[];
  isLoading?: boolean;
  error?: string | null;
}

export function FeaturedArticlesSection({
  featuredPosts,
  isLoading = false,
  error = null,
}: FeaturedArticlesSectionProps) {
  // Animation variants for the section
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (error) {
    return (
      <section className="bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            className="text-center py-12 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm rounded-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
              Unable to Load Featured Articles
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We're having trouble loading the featured articles. Please try
              again later.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/blog">
                <Button variant="outline" size="sm">
                  Browse All Articles
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Loading header with animation */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 bg-transparent p-6 rounded-none border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64"></div>
            </div>
          </motion.div>

          {/* Loading cards with staggered animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className="animate-pulse"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="aspect-[3/2] bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="h-full w-full flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ zIndex: 10, position: "relative" }}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl h-full flex flex-col items-center justify-center">
        <motion.div
          className="text-center mb-12 md:mb-16"
          variants={headerVariants}
        >
          <FocusEnhancer intensity={1.5}>
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Featured Articles
            </motion.h2>
          </FocusEnhancer>
          <motion.p 
            className="text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {featuredPosts.length > 0
              ? `Discover our most engaging content, curated based on reader engagement and quality`
              : "Discover featured articles from our blog"}
          </motion.p>
        </motion.div>

        {/* View All Featured Link */}
        {featuredPosts.length > 0 && (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <LinkLoadingWrapper href="/blog" showIndicator={true}>
              <motion.span 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-consciousness to-accent-quantum bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200 font-medium text-lg group cursor-pointer"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                View All Featured Articles
                <motion.svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 text-accent-consciousness"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </motion.svg>
              </motion.span>
            </LinkLoadingWrapper>
          </motion.div>
        )}

        {/* Featured Articles using new magazine-style grid layout */}
        {featuredPosts.length > 0 ? (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={index === 0 ? "md:col-span-2" : ""}
                >
                  <FocusEnhancer intensity={index === 0 ? 1.2 : 0.8}>
                    {index === 0 ? (
                      <FeaturedHeroCard
                        id={post.id}
                        title={post.title}
                        excerpt={post.excerpt}
                        coverImage={post.coverImage || post.cover_image}
                        date={post.date}
                        category={post.category}
                        slug={post.slug}
                        premium={post.premium}
                        likes_count={post.likes_count}
                        comments_count={post.comments_count}
                        views_count={post.views_count}
                        content_type={post.content_type}
                        recommendation_tags={post.recommendation_tags}
                      />
                    ) : (
                      <FeaturedSecondaryCard
                        id={post.id}
                        title={post.title}
                        excerpt={post.excerpt}
                        coverImage={post.coverImage || post.cover_image}
                        date={post.date}
                        category={post.category}
                        slug={post.slug}
                        premium={post.premium}
                        likes_count={post.likes_count}
                        comments_count={post.comments_count}
                        views_count={post.views_count}
                        content_type={post.content_type}
                        recommendation_tags={post.recommendation_tags}
                      />
                    )}
                  </FocusEnhancer>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            className="text-center py-12 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm rounded-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
              No Featured Articles Available
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We're working on curating some amazing content for you. Check out
              our latest posts instead.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/blog">
                <Button variant="outline" size="sm">
                  Browse All Articles
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
