"use client";

import dynamic from "next/dynamic";

// Dynamic imports for framer-motion components with ssr: false
export const DynamicMobileMenu = dynamic(
  () =>
    import("./header-mobile-menu-client").then((mod) => ({
      default: mod.HeaderMobileMenuClient,
    })),
  { ssr: false },
);
export const DynamicNavLinks = dynamic(
  () =>
    import("./header-nav-links-client").then((mod) => ({
      default: mod.HeaderNavLinksClient,
    })),
  { ssr: false },
);
export const DynamicScrollEffects = dynamic(
  () =>
    import("./header-scroll-effects-client").then((mod) => ({
      default: mod.HeaderScrollEffectsClient,
    })),
  { ssr: false },
);
