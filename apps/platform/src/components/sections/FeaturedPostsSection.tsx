"use client";

import Link from "next/link";
import { OptimizedBlogListWithHelpers } from "@/components/blog/OptimizedBlogList";

const FeaturedPostsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            Latest Insights from the Blog
          </h2>
          <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            Explore our latest articles on conscious evolution, integral theory,
            and the synthesis of material success with spiritual depth. Each
            piece offers actionable insights for your journey of
            self-actualization.
          </p>
        </div>

        {/* Blog Posts List */}
        <div className="max-w-4xl mx-auto">
          <OptimizedBlogListWithHelpers limit={3} />
        </div>

        {/* View All Posts Link */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-consciousness to-accent-quantum bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200 font-medium text-lg group"
          >
            View All Articles
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 text-accent-consciousness"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPostsSection;
