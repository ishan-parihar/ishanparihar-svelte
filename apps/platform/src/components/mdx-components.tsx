import Link from "next/link";
import Image from "next/image";
import React, { ReactNode, DetailedHTMLProps, HTMLAttributes } from "react";
import { BlogImage } from "@/components/optimized/OptimizedImage";

type HeadingProps = {
  children?: ReactNode;
  id?: string;
};

type CommonProps = {
  children?: ReactNode;
};

type CodeBlockProps = DetailedHTMLProps<
  HTMLAttributes<HTMLPreElement>,
  HTMLPreElement
> & {
  className?: string;
};

// Clean heading components for MDX content
const H1 = ({ children, id }: HeadingProps) => {
  return (
    <h1
      id={id}
      className="text-3xl font-heading mt-10 mb-6 text-foreground relative group scroll-mt-[100px]"
    >
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Link to ${id}`}
        >
          #
        </a>
      )}
    </h1>
  );
};

const H2 = ({ children, id }: HeadingProps) => {
  return (
    <h2
      id={id}
      className="text-2xl font-heading mt-8 mb-4 text-foreground relative group scroll-mt-[100px]"
    >
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Link to ${id}`}
        >
          #
        </a>
      )}
    </h2>
  );
};

const H3 = ({ children, id }: HeadingProps) => {
  return (
    <h3
      id={id}
      className="text-xl font-heading mt-6 mb-3 text-foreground relative group scroll-mt-[100px]"
    >
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Link to ${id}`}
        >
          #
        </a>
      )}
    </h3>
  );
};

const H4 = ({ children, id }: HeadingProps) => {
  return (
    <h4
      id={id}
      className="text-lg font-ui font-semibold mt-6 mb-3 text-foreground relative group scroll-mt-[100px]"
    >
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Link to ${id}`}
        >
          #
        </a>
      )}
    </h4>
  );
};

// Enhanced P component that checks if its children include block-level elements
// If a child is a block element (like CustomImage), it will render it directly
// instead of wrapping it in a <p> tag to prevent invalid HTML nesting
const P = ({ children }: CommonProps) => {
  // Check if children is a single element that should not be wrapped in a <p>
  // This helps prevent invalid HTML nesting like <p><div>...</div></p>
  const childrenArray = React.Children.toArray(children);

  // If there's only one child and it's the CustomImage component, render it directly
  if (childrenArray.length === 1) {
    const child = childrenArray[0];

    // Check if the child is a React element
    if (React.isValidElement(child)) {
      // Check if it's our CustomImage component or has a specific type that shouldn't be in a <p>
      // This is a simplified check - in a real app you might need more sophisticated detection
      const childType = child.type;
      const childTypeStr = String(childType);

      // If it's our CustomImage component or another component that renders a div
      if (
        childType === CustomImage ||
        childTypeStr.includes("CustomImage") ||
        childTypeStr.includes("Image")
      ) {
        // Return the child directly without wrapping it in a <p>
        return child;
      }
    }
  }

  // Otherwise, render as a normal paragraph
  return (
    <p className="mb-6 text-foreground leading-relaxed font-ui">{children}</p>
  );
};

const UL = ({ children }: CommonProps) => (
  <ul className="mb-6 list-disc pl-8 text-foreground !list-outside">
    {children}
  </ul>
);

const OL = ({ children }: CommonProps) => (
  <ol className="mb-6 list-decimal pl-8 text-foreground !list-outside">
    {children}
  </ol>
);

const LI = ({ children }: CommonProps) => (
  <li className="mb-2 !list-item">{children}</li>
);

const Blockquote = ({ children }: CommonProps) => (
  <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-foreground">
    {children}
  </blockquote>
);

const CustomLink = ({
  href,
  children,
  ...props
}: {
  href?: string;
  children?: ReactNode;
  [key: string]: any;
}) => {
  if (href?.startsWith("/")) {
    return (
      <Link href={href} className="text-primary hover:underline" {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
      {...props}
    >
      {children}
    </a>
  );
};

// Custom component for images in MDX with simplified, reliable rendering
// This component is rendered directly without a div wrapper to prevent invalid nesting
// when used inside paragraph tags in MDX content
const CustomImage = ({
  src,
  alt,
  width,
  height,
  ...props
}: {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}) => {
  if (!src) return null;

  // Apply the same URL fixing logic used in blog cards for consistency
  const getFixedImageUrl = (imageUrl: string): string => {
    let fixedUrl = imageUrl;

    // Fix problematic URL patterns directly in the component
    // This ensures MDX images get the same URL fixes as blog cards
    if (fixedUrl.includes("/blog-images/blog/public/")) {
      fixedUrl = fixedUrl.replace(
        "/blog-images/blog/public/",
        "/blog-images/public/",
      );
      console.log(`🔧 MDX IMAGE - FIXED URL: "${imageUrl}" -> "${fixedUrl}"`);
    } else if (fixedUrl.includes("/blog-images/blog/")) {
      fixedUrl = fixedUrl.replace(
        "/blog-images/blog/",
        "/blog-images/",
      );
      console.log(`🔧 MDX IMAGE - FIXED URL: "${imageUrl}" -> "${fixedUrl}"`);
    }

    return fixedUrl;
  };

  const fixedSrc = getFixedImageUrl(src);

  // Use Next.js Image directly for more reliable rendering
  // The click handler will be added by the useImageCollection hook
  // Add data-original-src to preserve the original URL for ImageViewer
  return (
    <Image
      src={fixedSrc}
      alt={alt || ""}
      width={width || 800}
      height={height || 450}
      className="w-full h-auto my-8 cursor-pointer transition-opacity hover:opacity-90"
      priority={false} // Blog content images are not critical for initial load
      data-original-src={src} // Preserve original source for ImageViewer
      style={{ maxWidth: '100%', height: 'auto' }}
      {...props}
    />
  );
};

// Strong tag
const Strong = ({ children }: CommonProps) => (
  <strong className="font-bold">{children}</strong>
);

// Inline code
const Code = ({ children }: CommonProps) => (
  <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono">
    {children}
  </code>
);

// Code block with optional syntax highlighting
const Pre = ({ children, className, ...props }: CodeBlockProps) => {
  // Extract language from className (format: language-js, language-python, etc.)
  const language = className ? className.replace("language-", "") : "";

  return (
    <div className="relative group">
      {language && (
        <div className="absolute right-4 top-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded font-mono">
          {language}
        </div>
      )}
      <pre
        className={`bg-muted p-4 pt-10 rounded-none overflow-x-auto my-6 text-sm font-mono ${className || ""}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
};

// HR element
const HR = () => <hr className="my-8 border-t border-border" />;

// Table components
const Table = ({ children }: CommonProps) => (
  <div className="overflow-x-auto my-6">
    <table className="w-full border-collapse">{children}</table>
  </div>
);

const THead = ({ children }: CommonProps) => (
  <thead className="bg-muted text-foreground">{children}</thead>
);

const TR = ({ children }: CommonProps) => (
  <tr className="border-b border-border">{children}</tr>
);

const TH = ({ children }: CommonProps) => (
  <th className="px-4 py-3 text-left font-medium">{children}</th>
);

const TD = ({ children }: CommonProps) => (
  <td className="px-4 py-3">{children}</td>
);

// Callout component for important notes, warnings, etc.
const Callout = ({
  children,
  type = "info",
  ...props
}: CommonProps & { type?: "info" | "warning" | "error" | "success" }) => {
  const typeStyles = {
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    warning:
      "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    error:
      "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    success:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  };

  const icons = {
    info: "💡",
    warning: "⚠️",
    error: "🚫",
    success: "✅",
  };

  return (
    <div
      className={`p-4 my-6 border-l-4 rounded-r-lg ${typeStyles[type]}`}
      {...props}
    >
      <div className="flex items-start">
        <span className="mr-2 text-lg">{icons[type]}</span>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Details/Summary for collapsible content
const Details = ({
  children,
  ...props
}: DetailedHTMLProps<
  HTMLAttributes<HTMLDetailsElement>,
  HTMLDetailsElement
>) => (
  <details className="my-4 border border-border rounded-none" {...props}>
    {children}
  </details>
);

const Summary = ({
  children,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>) => (
  <summary
    className="p-3 font-medium cursor-pointer hover:bg-muted/50"
    {...props}
  >
    {children}
  </summary>
);

// Section component for content under headings - now just a simple div
const Section = ({
  children,
  headingId,
  ...props
}: CommonProps & { headingId?: string }) => (
  <div className="ml-4 mt-2 mb-6" {...props}>
    {children}
  </div>
);

// Export all components
export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  blockquote: Blockquote,
  a: CustomLink,
  img: CustomImage,
  Image: CustomImage,
  strong: Strong,
  code: Code,
  pre: Pre,
  hr: HR,
  table: Table,
  thead: THead,
  tr: TR,
  th: TH,
  td: TD,
  Callout,
  details: Details,
  summary: Summary,
  Section,
};
