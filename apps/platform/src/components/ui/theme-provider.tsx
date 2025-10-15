"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  // Return the provider without animation wrappers to prevent flickering
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
