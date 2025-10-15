import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="text-gray-600 mb-6">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/blog"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Return to Blog
        </Link>
      </div>
    </main>
  );
}
