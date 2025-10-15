"use client";

import { useRef, useEffect } from "react";
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  quotePlugin,
  linkPlugin,
  listsPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  imagePlugin,
  InsertThematicBreak,
  codeBlockPlugin,
  CodeToggle,
  thematicBreakPlugin,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useTheme } from "next-themes";

// Custom CSS to fix dark mode issues with MDXEditor
import "./mdxeditor-theme.css";
// Import the same styling used in blog posts for consistent appearance
import "@/app/blog/mdx-clean.css";

interface MDXEditorWrapperProps {
  markdown: string;
  onChange: (markdown: string) => void;
  initialContent?: string;
  editorRef?: React.RefObject<MDXEditorMethods | null>;
}

export function MDXEditorWrapper({
  markdown,
  onChange,
  initialContent,
  editorRef,
}: MDXEditorWrapperProps) {
  const localEditorRef = useRef<MDXEditorMethods>(null);
  const { theme, resolvedTheme } = useTheme();

  // Image upload handler for MDXEditor
  const imageUploadHandler = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Use article-images bucket for content images
      formData.append("bucket", "article-images");

      // Upload image to server using the API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      if (!data.fileUrl) {
        throw new Error("No image URL returned from server");
      }

      // Store the bucket path in localStorage for future use
      if (data.bucketPath) {
        try {
          const storedPaths = JSON.parse(
            localStorage.getItem("image_bucket_paths") || "{}",
          );
          storedPaths[data.fileUrl] = data.bucketPath;
          localStorage.setItem(
            "image_bucket_paths",
            JSON.stringify(storedPaths),
          );
        } catch (err) {
          console.error("Error storing bucket path in localStorage:", err);
        }
      }

      // Return the URL to be inserted into the MDX editor
      return data.fileUrl;
    } catch (err: any) {
      console.error("Error uploading image:", err);
      throw err;
    }
  };

  return (
    <div className="mdx-editor-container">
      <MDXEditor
        ref={editorRef || localEditorRef}
        markdown={markdown}
        onChange={onChange}
        // CRITICAL FIX: Simplified contentEditableClassName to match blog post styling exactly
        contentEditableClassName="mdx-clean-content prose dark:prose-invert prose-lg max-w-none"
        className={`mdx-editor-wrapper ${theme === "dark" || resolvedTheme === "dark" ? "dark-theme" : ""}`}
        plugins={[
          headingsPlugin({
            allowedHeadingLevels: [1, 2, 3, 4, 5, 6], // Allow all heading levels for proper hierarchy
          }),
          quotePlugin(),
          linkPlugin(),
          listsPlugin({
            checkBoxClassName: "mr-1 disabled:opacity-100",
            listItemClassName: "my-2",
          }),
          imagePlugin({
            imageUploadHandler: imageUploadHandler,
            disableImageResize: false,
          }),
          codeBlockPlugin(),
          thematicBreakPlugin(),
          diffSourcePlugin({
            diffMarkdown:
              initialContent ||
              "# New Blog Post\n\nStart writing your content here...",
            viewMode: "rich-text",
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
                <CreateLink />
                <InsertImage />
                <CodeToggle />
                <InsertThematicBreak />
              </DiffSourceToggleWrapper>
            ),
          }),
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  );
}
