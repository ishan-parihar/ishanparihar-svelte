"use client";

import { useMemo, useRef, useEffect } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxComponents } from "./mdx-components";
import { MDXProviderWrapper } from "./mdx-provider";
import { ImageViewerProvider } from "@/contexts/ImageViewerContext";
import { ImageViewer } from "@/components/blog/ImageViewer";
import { useImageCollection } from "@/hooks/useImageViewer";

interface MDXBlogContentProps {
  source: MDXRemoteSerializeResult;
}

// Internal component that uses the image viewer hook
function MDXContentWithImageViewer({ source }: MDXBlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Set up image collection and click handlers
  useImageCollection(contentRef as React.RefObject<HTMLElement>);

  // Memoize the MDX content to prevent unnecessary re-renders
  const content = useMemo(() => {
    return (
      <MDXProviderWrapper>
        <div
          ref={contentRef}
          className="prose dark:prose-invert max-w-none mdx-clean-content prose-ul:list-disc prose-ol:list-decimal prose-li:list-item prose-li:my-1"
        >
          <MDXRemote {...source} components={mdxComponents} />
        </div>
      </MDXProviderWrapper>
    );
  }, [source]);

  return content;
}

export function MDXBlogContent({ source }: MDXBlogContentProps) {
  return <MDXContentWithImageViewer source={source} />;
}
