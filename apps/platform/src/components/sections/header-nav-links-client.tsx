"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigationItems } from "@/config/navigation";

export function HeaderNavLinksClient() {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <div className="flex items-center space-x-2 lg:space-x-4">
      {navigationItems.map((item) => {
        const isActive = pathname === item.path || (item.dropdownItems && item.dropdownItems.some(subItem => pathname === subItem.path));

        if (item.hasDropdown) {
          return (
            <DropdownMenu key={item.name}>
              <DropdownMenuTrigger asChild>
                <button
                  data-active={isActive}
                  className={`relative px-3 py-1.5 text-sm font-ui font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-1 bg-transparent border-none cursor-pointer
                    ${
                      isActive
                        ? "text-accent font-bold scale-105"
                        : "text-muted-foreground hover:text-foreground"
                    }
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-none
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
                  <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-72 rounded-none border shadow-lg backdrop-blur-sm"
                style={{
                  backgroundColor: isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(255, 255, 255, 0.95)",
                  borderColor: isDark ? "rgb(39, 39, 42)" : "rgb(229, 231, 235)",
                  boxShadow: isDark
                    ? "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"
                    : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
                sideOffset={12}
                align="start"
              >
                {item.dropdownItems?.map((subItem) => (
                  <DropdownMenuItem key={subItem.name} asChild className="rounded-none">
                    <LinkLoadingWrapper
                      href={subItem.path}
                      showIndicator={pathname !== subItem.path}
                    >
                      <Link
                        href={subItem.path}
                        className={`block w-full px-4 py-3 transition-all duration-200 rounded-none group
                          ${pathname === subItem.path
                            ? 'bg-accent/10 text-accent border-l-2 border-accent'
                            : 'text-foreground hover:bg-muted hover:text-accent hover:border-l-2 hover:border-accent/50 border-l-2 border-transparent'
                          }
                        `}
                      >
                        <div className="font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200">
                          {subItem.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground/80">
                          {subItem.description}
                        </div>
                      </Link>
                    </LinkLoadingWrapper>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <LinkLoadingWrapper
            key={item.name}
            href={item.path}
            showIndicator={!isActive}
          >
            <Link
              href={item.path}
              data-active={isActive}
              className={`relative px-3 py-1.5 text-sm font-ui font-bold transition-all duration-300 transform hover:scale-105
                ${
                  isActive
                    ? "text-accent font-bold scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-none
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
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </Link>
          </LinkLoadingWrapper>
        );
      })}
    </div>
  );
}
