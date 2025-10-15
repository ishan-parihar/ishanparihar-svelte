"use client";

import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "./mdx-components";
import { ReactNode } from "react";

interface MDXProviderWrapperProps {
  children: ReactNode;
}

export function MDXProviderWrapper({ children }: MDXProviderWrapperProps) {
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}
