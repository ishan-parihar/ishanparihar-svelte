"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function HeaderScrollEffectsClient() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  // Handle mounting for theme detection and initial positioning
  useEffect(() => {
    setMounted(true);

    // Initial positioning setup after mount
    const initializePositioning = () => {
      const header = document.querySelector("header.header-nav");
      const blogNavigation = document.querySelector(".blog-navigation");
      const blogSidebar = document.querySelector(".blog-sidebar");

      if (header && blogNavigation) {
        const headerHeight = header.getBoundingClientRect().height;
        (blogNavigation as HTMLElement).style.top = `${headerHeight}px`;

        if (blogSidebar) {
          const blogNavHeight = blogNavigation.getBoundingClientRect().height;
          const totalOffset = headerHeight + blogNavHeight + 20;
          (blogSidebar as HTMLElement).style.top = `${totalOffset}px`;
        }
      }
    };

    // Run after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(initializePositioning, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Optimize scroll handling - PERSISTENT NAVIGATION (Medium-style)
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;

      // Keep navigation always visible (Medium-style persistent navigation)
      setVisible(true);

      // Update styling based on scroll position
      setScrolled(offset > 20);

      // Calculate scroll progress
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(offset / height, 1) : 0;
      setScrollProgress(progress);
    };

    const onScroll = () => {
      requestAnimationFrame(handleScroll);
    };

    // Handle window resize to recalculate header dimensions
    const handleResize = () => {
      // Trigger a re-render to recalculate positions
      setScrolled(prev => prev);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  // Use theme-aware background colors for header
  const headerBg = isDark ? "#1C1C1F" : "#E8E8DE"; // Dark charcoal : Eggshell

  const headerBorder = isDark
    ? scrolled
      ? "#404040" // ui-border-light in dark mode
      : "#2E2E32" // ui-border in dark mode
    : scrolled
      ? "#D8D8CE" // ui-border in light mode
      : "#E0E0D6"; // ui-border-light in light mode

  const headerShadow = scrolled
    ? isDark
      ? "0 4px 10px rgba(0, 0, 0, 0.3)"
      : "0 4px 10px rgba(0, 0, 0, 0.05)"
    : "none";

  // Apply scroll effects to both header and blog navigation - PERSISTENT NAVIGATION
  useEffect(() => {
    const header = document.querySelector("header.header-nav");
    const blogNavigation = document.querySelector(".blog-navigation");
    const blogSidebar = document.querySelector(".blog-sidebar");

    if (header) {
      // Apply styles to header
      header.classList.toggle("scrolled", scrolled);

      // Apply inline styles to header
      (header as HTMLElement).style.background = headerBg;
      (header as HTMLElement).style.borderBottom = `1px solid ${headerBorder}`;
      (header as HTMLElement).style.boxShadow = headerShadow;

      // Keep header always visible (persistent navigation) - remove transform overrides
      (header as HTMLElement).style.transform = "";
      (header as HTMLElement).style.opacity = "";
      (header as HTMLElement).style.transition =
        "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease";
    }

    // Apply persistent scroll behavior to blog navigation if it exists
    if (blogNavigation && header) {
      // Get the actual header height dynamically
      const headerRect = header.getBoundingClientRect();
      const headerHeight = headerRect.height;

      // Update blog navigation positioning to match header exactly
      (blogNavigation as HTMLElement).style.top = `${headerHeight}px`;
      (blogNavigation as HTMLElement).style.background = headerBg;
      (blogNavigation as HTMLElement).style.borderBottom =
        `1px solid ${headerBorder}`;
      (blogNavigation as HTMLElement).style.transition =
        "background-color 0.3s ease, border-color 0.3s ease, top 0.3s ease";

      // Add scrolled class for additional styling if needed
      blogNavigation.classList.toggle("scrolled", scrolled);

      // Update blog sidebar positioning if it exists
      if (blogSidebar) {
        const blogNavRect = blogNavigation.getBoundingClientRect();
        const blogNavHeight = blogNavRect.height;
        const totalOffset = headerHeight + blogNavHeight + 20; // 20px buffer

        (blogSidebar as HTMLElement).style.top = `${totalOffset}px`;
        (blogSidebar as HTMLElement).style.transition = "top 0.3s ease";
      }
    }

    // Log theme state for debugging
    console.log("Header theme state:", {
      isDark,
      theme,
      resolvedTheme,
      scrolled,
      headerBg,
      blogNavVisible: !!blogNavigation,
    });
  }, [
    scrolled,
    visible,
    headerBg,
    headerBorder,
    headerShadow,
    isDark,
    theme,
    resolvedTheme,
  ]);

  // Return null - we're using ReadingProgressServer component instead
  return null;
}
