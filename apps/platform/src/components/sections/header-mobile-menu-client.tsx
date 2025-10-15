"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useSession, signOut } from "next-auth/react";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import { navigationItems } from "@/config/navigation";

export function HeaderMobileMenuClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // Handle mounting for theme detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  // Solid background colors for mobile menu
  const headerBg = isDark ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`
          relative flex items-center justify-center
          w-9 h-9 rounded-full
          transition-all duration-200
          border
          ${
            isDark
              ? "border-slate-700 hover:border-slate-600"
              : "border-slate-200 hover:border-slate-300"
          }
          bg-transparent
        `}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isMenuOpen ? "open" : "closed"}
            initial={{ opacity: 0, rotate: isMenuOpen ? -90 : 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: isMenuOpen ? 90 : -90 }}
            transition={{ duration: 0.15 }}
          >
            {isMenuOpen ? (
              <X
                size={16}
                className={isDark ? "text-slate-100" : "text-slate-700"}
              />
            ) : (
              <Menu
                size={16}
                className={isDark ? "text-slate-100" : "text-slate-700"}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            id="mobile-menu"
            className="md:hidden border-b border-black/10 dark:border-white/10 shadow-lg fixed top-[60px] left-0 right-0 z-50"
            role="navigation"
            aria-label="Mobile navigation"
            style={{ background: headerBg }}
          >
            <div className="w-full mx-auto px-4 py-5">
              <MobileNavLinks />
              <MobileAuthButtons />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavLinks() {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <div className="flex flex-col space-y-3 items-center">
      {navigationItems.map((item) => {
        const isActive = pathname === item.path || (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.path));

        return (
          <div key={item.name} className="w-full">
            <LinkLoadingWrapper
              href={item.path}
              showIndicator={!isActive}
            >
              <Link
                href={item.path}
                data-active={isActive}
                className={`relative px-3 py-1.5 text-sm font-bold transition-all duration-300 rounded-none
                  block w-full text-center transform hover:scale-105 ${
                    isActive
                      ? "text-accent bg-accent/10 scale-105"
                      : "text-foreground hover:text-accent hover:bg-muted"
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <motion.span
                  initial={{ opacity: 0.7 }}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
              </Link>
            </LinkLoadingWrapper>

            {/* Mobile dropdown items */}
            {item.hasDropdown && item.dropdownItems && (
              <div className="mt-2 ml-4 space-y-2">
                {item.dropdownItems.map((subItem) => (
                  <LinkLoadingWrapper
                    key={subItem.name}
                    href={subItem.path}
                    showIndicator={pathname !== subItem.path}
                  >
                    <Link
                      href={subItem.path}
                      className={`block px-3 py-1.5 text-xs rounded-none transition-all duration-300
                        ${pathname === subItem.path
                          ? "text-accent bg-accent/10"
                          : "text-muted-foreground hover:text-accent hover:bg-muted"
                        }
                      `}
                    >
                      {subItem.name}
                    </Link>
                  </LinkLoadingWrapper>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MobileAuthButtons() {
  const { openAuthModal } = useAuthModal();
  const { data: session, status } = useSession();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  // If user is authenticated, show account and sign out buttons
  if (status === "authenticated") {
    return (
      <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <Button
          asChild
          variant="outline"
          className={`
            w-full py-2.5 rounded-none
            bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90
            border border-black dark:border-white
            transition-all duration-200
          `}
        >
          <Link
            href="/account"
            className="flex items-center justify-center gap-2"
          >
            <UserCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">My Account</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full py-2.5 rounded-none"
          onClick={() => signOut({ callbackUrl: "/", redirect: true })}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  // If user is not authenticated, show sign in button
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <Button
          variant="outline"
          className={`
            w-full py-2.5 rounded-none
            bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90
            border border-black dark:border-white
            transition-all duration-200
          `}
          onClick={() => openAuthModal("signIn", "/account")}
        >
          <span className="text-sm font-medium">Sign In</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full py-2.5 rounded-none"
          onClick={() => openAuthModal("signUp", "/account")}
        >
          Create Account
        </Button>
      </div>
    );
  }

  // If status is loading, return null
  return null;
}
