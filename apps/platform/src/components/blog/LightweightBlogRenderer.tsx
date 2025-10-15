"use client";

import React from "react";
import Image from "next/image";

interface LightweightBlogRendererProps {
  htmlContent: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: string;
  category: string;
  isPremium?: boolean;
}

const LightweightBlogRenderer: React.FC<LightweightBlogRendererProps> = ({
  htmlContent,
  title,
  excerpt,
  coverImage,
  date,
  author,
  category,
  isPremium = false,
}) => {
  return (
    <article className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 text-xs font-medium rounded-none bg-transparent border border-foreground/40 text-foreground">
            {category}
          </span>
          {isPremium && (
            <span className="px-3 py-1 text-xs font-medium rounded-none bg-accent-quantum/20 border border-accent-quantum text-accent-quantum">
              Premium
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          {title}
        </h1>

        {excerpt && (
          <p className="text-lg text-secondary mb-6 leading-relaxed">
            {excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-secondary">
          <span>By {author}</span>
          <span>•</span>
          <time dateTime={date}>
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </header>

      {/* Cover Image */}
      {coverImage && coverImage !== "/default-blog-image.jpg" && (
        <div className="mb-8 relative w-full h-64 md:h-96">
          <Image
            src={
              coverImage.startsWith("/")
                ? coverImage
                : `/${coverImage.replace("public/", "")}`
            }
            alt={title}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
};

export default LightweightBlogRenderer;
