import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";

// Define simplified MDX options to avoid type issues
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug, // Automatically generates IDs for headings
      // Note: Removed rehype-autolink-headings to prevent headings from being clickable links
      // We use our custom TableOfContents component for navigation instead
    ],
    development: process.env.NODE_ENV === "development",
  },
};

/**
 * Clean markdown formatting from text before slug generation
 */
function cleanTextForSlug(text: string): string {
  return (
    text
      .trim()
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/`(.*?)`/g, "$1") // Code
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
      .replace(/~~(.*?)~~/g, "$1") // Strikethrough
      .replace(/__(.*?)__/g, "$1") // Alternative bold
      .replace(/_(.*?)_/g, "$1")
  ); // Alternative italic
}

/**
 * Clean markdown formatting from text for display purposes
 * This removes markdown syntax but preserves the text content
 */
export function cleanMarkdownForDisplay(text: string): string {
  return (
    text
      .trim()
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/`(.*?)`/g, "$1") // Code
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
      .replace(/~~(.*?)~~/g, "$1") // Strikethrough
      .replace(/__(.*?)__/g, "$1") // Alternative bold
      .replace(/_(.*?)_/g, "$1")
  ); // Alternative italic
}

/**
 * Extract headings from MDX content
 * @param content - The MDX content to extract headings from
 * @returns Array of headings with text, displayText, slug, and level
 */
export function extractHeadings(content: string) {
  if (!content) return [];

  const headings: Array<{
    text: string;
    displayText: string;
    slug: string;
    level: number;
  }> = [];
  const lines = content.split("\n");
  const slugger = new GithubSlugger(); // Use the same slugger as rehype-slug

  lines.forEach((line) => {
    // Match headings (h1 to h6)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();

      // Clean text for slug generation (same as rehype-slug does)
      const cleanedText = cleanTextForSlug(rawText);

      // Generate slug using github-slugger (same as rehype-slug)
      const slug = slugger.slug(cleanedText);

      // Store both raw text and cleaned display text
      const displayText = cleanMarkdownForDisplay(rawText);

      headings.push({
        text: rawText, // Keep original for compatibility
        displayText, // Cleaned text for display
        slug,
        level,
      });
    }
  });

  return headings;
}

/**
 * Serialize MDX content to be used with MDXRemote
 * @param content - The MDX content to serialize
 * @returns Serialized MDX content
 */
export async function serializeMDX(content: string) {
  // Use an empty string if no content is provided
  const mdxContent = content || "";

  try {
    return await serialize(mdxContent, mdxOptions);
  } catch (error) {
    console.error("Error serializing MDX:", error);
    // Return a minimal serialized result in case of error
    return await serialize("", {
      mdxOptions: { remarkPlugins: [], rehypePlugins: [] },
    });
  }
}

/**
 * Optimized server-side MDX serialization with caching
 * This function should be used on the server to pre-compile MDX content
 */
export async function serializeMDXServer(content: string, cacheKey?: string) {
  // Use an empty string if no content is provided
  const mdxContent = content || "";

  try {
    // For server-side compilation, we can use more aggressive optimization
    const optimizedOptions = {
      ...mdxOptions,
      mdxOptions: {
        ...mdxOptions.mdxOptions,
        // Disable development mode for better performance
        development: false,
        // Enable more aggressive optimizations
        providerImportSource: undefined, // Reduce bundle size
      },
    };

    return await serialize(mdxContent, optimizedOptions);
  } catch (error) {
    console.error("Error serializing MDX on server:", error);
    // Return a minimal serialized result in case of error
    return await serialize("", {
      mdxOptions: { remarkPlugins: [], rehypePlugins: [] },
    });
  }
}
