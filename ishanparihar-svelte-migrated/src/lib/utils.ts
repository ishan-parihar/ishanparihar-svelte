import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function relativeTime(date: string | number | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}
