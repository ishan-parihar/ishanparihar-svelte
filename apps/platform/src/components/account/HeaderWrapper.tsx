"use client";

import { HeaderServerCardNav } from "@/components/layout/HeaderServerCardNav";

export function HeaderWrapper() {
  // Platform navigation links
  const platformNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/offerings", label: "Offerings" },
  ];

  return <HeaderServerCardNav navLinks={platformNavLinks} showAuthButtons={true} />;
}
