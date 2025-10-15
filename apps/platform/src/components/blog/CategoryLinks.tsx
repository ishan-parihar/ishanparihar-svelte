"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import { Button } from "@/components/ui/button";

interface CategoryLinksProps {
  categories: string[];
  staticCategories: { name: string; href: string }[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function CategoryLinks({
  categories,
  staticCategories,
  activeTab,
  onTabChange,
}: CategoryLinksProps) {
  const pathname = usePathname();

  // Determine active category based on tab state or URL
  const getIsActive = (category: string, href: string) => {
    if (onTabChange && activeTab) {
      // Tab-based mode: use activeTab state
      const tabName = category.toLowerCase();
      return activeTab === tabName;
    } else {
      // Navigation-based mode: use URL
      if (href === "/blog" && pathname === "/blog") return true;
      return pathname === href;
    }
  };

  // Handle click events
  const handleClick = (category: string, href: string) => {
    if (onTabChange) {
      // Tab-based mode: call onTabChange
      const tabName = category.toLowerCase();
      onTabChange(tabName);
    }
    // If no onTabChange, the LinkLoadingWrapper will handle navigation
  };

  return (
    <>
      {/* Static categories first */}
      {staticCategories.map((category) => {
        const isActive = getIsActive(category.name, category.href);

        if (onTabChange) {
          // Tab-based mode: use button with onClick
          return (
            <Button
              key={category.name}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={`
                whitespace-nowrap rounded-none font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-md border border-neutral-900 dark:border-white"
                    : "text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"
                }
              `}
              onClick={() => handleClick(category.name, category.href)}
            >
              {category.name}
            </Button>
          );
        } else {
          // Navigation-based mode: use LinkLoadingWrapper
          return (
            <Button
              key={category.name}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={`
                whitespace-nowrap rounded-none font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-md border border-neutral-900 dark:border-white"
                    : "text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"
                }
              `}
              asChild
            >
              <LinkLoadingWrapper href={category.href} showIndicator={true}>
                {category.name}
              </LinkLoadingWrapper>
            </Button>
          );
        }
      })}

      {/* Dynamic categories */}
      {categories
        .filter((category) => typeof category === "string")
        .map((category) => {
          const categoryStr = String(category);
          const href = `/blog/category/${encodeURIComponent(categoryStr.toLowerCase())}`;
          const isActive =
            onTabChange && activeTab
              ? activeTab === categoryStr.toLowerCase()
              : pathname === href;

          if (onTabChange) {
            // Tab-based mode: use button with onClick
            return (
              <Button
                key={categoryStr}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`
                whitespace-nowrap rounded-none font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-md border border-neutral-900 dark:border-white"
                    : "text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"
                }
              `}
                onClick={() => handleClick(categoryStr, href)}
              >
                {categoryStr}
              </Button>
            );
          } else {
            // Navigation-based mode: use LinkLoadingWrapper
            return (
              <Button
                key={categoryStr}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`
                whitespace-nowrap rounded-none font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-md border border-neutral-900 dark:border-white"
                    : "text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"
                }
              `}
                asChild
              >
                <LinkLoadingWrapper href={href} showIndicator={true}>
                  {categoryStr}
                </LinkLoadingWrapper>
              </Button>
            );
          }
        })}
    </>
  );
}
