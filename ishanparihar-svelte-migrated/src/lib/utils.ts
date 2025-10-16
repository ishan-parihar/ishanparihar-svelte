export function extractPlainTextFromMDX(mdx: string): string {
  // This is a simplified version. For a more robust solution, you might need a proper parser.
  return mdx
    .replace(/---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/#[#\s]*/g, '') // Remove headings
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/>/g, '') // Remove blockquotes
    .replace(/`/g, '') // Remove inline code
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();
}
