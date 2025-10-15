import { getAdminBlogPostsServer } from "@/queries/adminQueriesServer";

export async function generateStaticParams() {
  // For admin pages, include drafts to allow editing all posts
  const posts = await getAdminBlogPostsServer({ includeDrafts: true });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
