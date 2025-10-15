"use client";

import { useRef, memo } from "react";
import { BlogSidebar } from "./BlogSidebar";
import { createClient } from "@/utils/supabase/client";
import { useFeaturedBlogPostsWithHelpers } from "@/queries/blogQueries";

interface BlogSidebarClientProps {
  featuredPosts?: any[];
}

const BlogSidebarClient = memo(function BlogSidebarClient({
  featuredPosts = [],
}: BlogSidebarClientProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Create Supabase client for queries
  const supabase = createClient();

  // Use cache helper hook for featured posts if not provided via props
  const { data: queryFeaturedPosts = [], isLoading: featuredPostsLoading } =
    useFeaturedBlogPostsWithHelpers(supabase, 3);

  // Use provided featured posts or fall back to query results
  const finalFeaturedPosts =
    featuredPosts.length > 0 ? featuredPosts : queryFeaturedPosts || [];

  return (
    <div
      ref={sidebarRef}
      className="blog-sidebar"
      style={{
        // Ensure proper sticky behavior with inline styles as fallback
        position: "sticky",
        top: "94px",
        alignSelf: "flex-start",
        height: "fit-content",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        transform: "translateZ(0)", // Force hardware acceleration
      }}
    >
      <BlogSidebar featuredPosts={finalFeaturedPosts} />
    </div>
  );
});

export { BlogSidebarClient };
