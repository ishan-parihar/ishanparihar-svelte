/**
 * Utility functions for text processing
 */

/**
 * Extracts plain text from MDX/Markdown content by removing markdown syntax
 * @param mdxContent - The MDX/Markdown content to process
 * @returns Clean plain text suitable for text-to-speech
 */
export function extractPlainTextFromMDX(mdxContent: string): string {
  if (!mdxContent) return "";

  let text = mdxContent;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, "Code block omitted for speech.");

  // Remove inline code
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove images
  text = text.replace(/!\[(.*?)\]\(.*?\)/g, "Image: $1.");

  // Convert links to just their text content
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");

  // Remove HTML tags but keep their content
  text = text.replace(/<[^>]*>([^<]*)<\/[^>]*>/g, "$1");

  // Remove self-closing HTML tags
  text = text.replace(/<[^>]*\/>/g, "");

  // Remove headings markers but keep the text
  text = text.replace(/^#{1,6}\s+(.+)$/gm, "$1");

  // Remove bold and italic markers
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");

  // Remove strikethrough
  text = text.replace(/~~(.*?)~~/g, "$1");

  // Convert bullet points to sentences
  text = text.replace(/^\s*[-*+]\s+(.+)$/gm, "Bullet point: $1.");

  // Convert numbered lists to sentences
  text = text.replace(/^\s*\d+\.\s+(.+)$/gm, "List item: $1.");

  // Remove blockquotes but keep content
  text = text.replace(/^\s*>\s+(.+)$/gm, "Quote: $1.");

  // Remove horizontal rules
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, "");

  // Remove extra whitespace
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

/**
 * Truncates text to a maximum length, ensuring it doesn't cut off in the middle of a sentence
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the truncated text
 * @returns Truncated text that ends with a complete sentence
 */
export function truncateToCompleteSentence(
  text: string,
  maxLength: number = 5000,
): string {
  if (!text || text.length <= maxLength) return text;

  // Find the last sentence boundary before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?"),
  );

  if (lastSentenceEnd === -1) {
    // If no sentence boundary found, just truncate at maxLength
    return truncated + "...";
  }

  // Return text up to the last complete sentence
  return text.substring(0, lastSentenceEnd + 1);
}
