import Link from "next/link";
import { HeaderMobileMenuClient } from "../sections/header-mobile-menu-client";
import { HeaderNavLinksClient } from "../sections/header-nav-links-client";
import { HeaderScrollEffectsClient } from "../sections/header-scroll-effects-client";
import { HeaderAuthButtonsClient } from "../sections/header-auth-buttons-client";
import { HeaderLogo } from "../ui/brand-logo";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { HeaderLoadingIndicator } from "../loading/PageLoadingManager";

interface NavLink {
  href: string;
  label: string;
}

interface HeaderServerProps {
  navLinks?: NavLink[];
  showAuthButtons?: boolean;
}

export function HeaderServer({
  navLinks,
  showAuthButtons = true,
}: HeaderServerProps) {
  return (
    <>
      {/* Static header structure */}
      <header className="fixed top-0 z-50 w-full h-16 lg:h-20 header-nav text-foreground bg-background border-b border-border">
        <div className="w-full h-full mx-auto flex items-center px-4 md:px-6 relative">
          {/* Logo */}
          <div className="flex items-center relative z-10 mr-auto">
            <HeaderLogo />
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <HeaderMobileMenuClient />
          </div>

          {/* Desktop Navigation - All moved to the right */}
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-5 ml-auto">
            <HeaderNavLinksClient />

            {/* Auth Buttons */}
            {showAuthButtons && <HeaderAuthButtonsClient />}
          </nav>

          {/* Loading indicator */}
          <HeaderLoadingIndicator />
        </div>
      </header>

      {/* Client components for interactive features */}
      <HeaderScrollEffectsClient />
    </>
  );
}
