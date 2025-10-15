// This file should only be imported on the server side
// It contains heavy MDX processing dependencies that should not be bundled to the client

import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Convert MDX content to HTML string on the server using unified processor
 * This function should only be called on the server side
 */
export async function mdxToHtml(content: string): Promise<string> {
  if (!content) {
    return "";
  }

  try {
    // Use unified processor to convert markdown to HTML
    const processor = unified()
      .use(remarkParse) // Parse markdown
      .use(remarkGfm) // GitHub flavored markdown
      .use(remarkRehype) // Convert to HTML AST
      .use(rehypeSlug) // Add IDs to headings
      .use(rehypeStringify); // Convert to HTML string

    const result = await processor.process(content);
    return String(result);
  } catch (error) {
    console.error("Error converting MDX to HTML:", error);
    // Return the raw content as fallback with basic markdown processing
    return content
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }
}

/**
 * Extract headings from MDX content for table of contents
 */
export function extractHeadingsFromMdx(content: string) {
  if (!content) return [];

  const headings: Array<{ text: string; slug: string; level: number }> = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      headings.push({ text, slug, level });
    }
  });

  return headings;
}
