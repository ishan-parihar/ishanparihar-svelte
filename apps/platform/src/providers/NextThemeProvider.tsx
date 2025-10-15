"use client";

import { ThemeProvider } from "next-themes";

export function NextThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark" // Force dark theme
      enableSystem={false} // Disable system theme detection
      storageKey="theme" // Explicitly set storage key
      disableTransitionOnChange={false} // Enable transitions for smoother theme changes
      value={{ dark: "dark" }} // Only support dark theme
      forcedTheme="dark" // Force dark theme
    >
      {children}
    </ThemeProvider>
  );
}
