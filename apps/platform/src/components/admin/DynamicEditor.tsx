// src/components/admin/DynamicEditor.tsx
"use client";

import dynamic from "next/dynamic";

const MDXEditorWrapper = dynamic(
  () =>
    import("@/components/admin/mdx-editor").then((mod) => mod.MDXEditorWrapper),
  {
    ssr: false, // The editor relies on browser APIs.
    loading: () => (
      <div className="flex justify-center items-center min-h-[500px] bg-muted/20">
        <p className="text-muted-foreground">Loading Editor...</p>
      </div>
    ),
  },
);

// Pass through all props to the dynamically loaded editor
const DynamicEditor = (props: any) => {
  return <MDXEditorWrapper {...props} />;
};

export default DynamicEditor;
