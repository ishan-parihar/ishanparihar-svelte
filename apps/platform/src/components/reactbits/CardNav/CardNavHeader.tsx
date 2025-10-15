"use client";

import React from "react";
import { useTheme } from "next-themes";
import CardNav, { CardNavItem } from "./CardNav";

interface NavLink {
  href: string;
  label: string;
}

interface CardNavHeaderProps {
  navLinks?: NavLink[];
  showAuthButtons?: boolean;
  className?: string;
}

export function CardNavHeader({
  navLinks,
  showAuthButtons = true,
  className = "",
}: CardNavHeaderProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  // Default navigation links if none provided
  const defaultNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/assessments", label: "Assessments" },
    { href: "/framework", label: "Framework" },
    { href: "/offerings", label: "Offerings" },
  ];

  const links = navLinks || defaultNavLinks;

  // Organize navigation links into card categories
  const cardItems: CardNavItem[] = [
    {
      label: "Explore",
      bgColor: isDark ? "#1f2937" : "#f3f4f6",
      textColor: isDark ? "#ffffff" : "#111827",
      links: [
        {
          label: "Home",
          href: "/",
          ariaLabel: "Go to homepage"
        },
        {
          label: "About",
          href: "/about",
          ariaLabel: "Learn about us"
        },
        {
          label: "Framework",
          href: "/framework",
          ariaLabel: "Our methodology and approach"
        }
      ]
    },
    {
      label: "Content",
      bgColor: isDark ? "#374151" : "#e5e7eb",
      textColor: isDark ? "#ffffff" : "#111827",
      links: [
        {
          label: "Blog",
          href: "/blog",
          ariaLabel: "Read our blog posts"
        },
        {
          label: "Assessments",
          href: "/assessments",
          ariaLabel: "Take our assessments"
        }
      ]
    },
    {
      label: "Services",
      bgColor: isDark ? "#4b5563" : "#d1d5db",
      textColor: isDark ? "#ffffff" : "#111827",
      links: [
        {
          label: "Offerings",
          href: "/offerings",
          ariaLabel: "View our services and solutions"
        }
      ]
    }
  ];

  return (
    <CardNav
      logoText="Ishan Parihar"
      items={cardItems}
      className={className}
      baseColor={isDark ? "#111827" : "#ffffff"}
      menuColor={isDark ? "#ffffff" : "#000000"}
      buttonBgColor={isDark ? "#ffffff" : "#000000"}
      buttonTextColor={isDark ? "#000000" : "#ffffff"}
      showAuthButtons={showAuthButtons}
    />
  );
}
