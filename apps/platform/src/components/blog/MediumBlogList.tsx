"use client";

import React, { useState, useEffect } from "react";
import { MediumBlogCard } from "./MediumBlogCard";
import { StaggeredList, AnimatedSection } from "@/components/motion";

// Define BlogPost interface
interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  cover_image?: string;
  date: string;
  author?: string;
  author_user_id?: string;
  category: string;
  featured: boolean;
  content: string;
  draft?: boolean;
  premium?: boolean;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  author_details?: {
    id: string;
    display_name: string;
    profile_picture_url: string | null;
    role: string;
  } | null;
}

interface MediumBlogListProps {
  initialPosts: BlogPost[];
}

const MediumBlogListComponent = ({ initialPosts }: MediumBlogListProps) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts || []);

  // Helper function to get the correct image URL
  const getBlogImage = (post: BlogPost): string => {
    // Get the initial URL
    let imageUrl =
      post.coverImage || post.cover_image || "/default-blog-image.jpg";

    // CRITICAL FIX: Fix problematic URL patterns directly in the component
    if (imageUrl.includes("/blog-images/blog/public/")) {
      imageUrl = imageUrl.replace(
        "/blog-images/blog/public/",
        "/blog-images/public/",
      );
    } else if (imageUrl.includes("/blog-images/blog/")) {
      imageUrl = imageUrl.replace("/blog-images/blog/", "/blog-images/");
    }

    return imageUrl;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {posts && posts.length > 0 ? (
        <StaggeredList
          className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60"
          staggerDelay={0.02}
        >
          {posts.map((post, index) => (
            <MediumBlogCard
              key={post.slug}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              coverImage={getBlogImage(post)}
              date={post.date}
              category={post.category}
              slug={post.slug}
              index={index}
              premium={post.premium}
              likes_count={post.likes_count}
              comments_count={post.comments_count}
              views_count={post.views_count}
              author={post.author}
              author_details={post.author_details}
            />
          ))}
        </StaggeredList>
      ) : (
        <AnimatedSection className="text-center py-20 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
            No articles found
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Check back later for new content
          </p>
        </AnimatedSection>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MediumBlogList = React.memo(MediumBlogListComponent);
