import React, { useLayoutEffect, useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";
import { UserCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logoText?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  showAuthButtons?: boolean;
}

// Breadcrumb types
export type BreadcrumbItem = {
  label: string;
  href: string;
  isCurrentPage: boolean;
};

// Route mapping for breadcrumb labels
const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/blog": "Blog",
  "/assessments": "Assessments",
  "/framework": "Framework",
  "/offerings": "Offerings",
  "/contact": "Contact",
  "/account": "Account",
  "/admin": "Admin",
  "/projects": "Projects",
  "/premium": "Premium",
  "/pricing": "Pricing",
  "/privacy": "Privacy",
  "/terms": "Terms",
  "/shipping": "Shipping",
  "/payment": "Payment",
  "/newsletter": "Newsletter",
  "/user": "User",
  "/auth": "Authentication",
  // Framework sub-routes
  "/framework/integral-theory": "Integral Theory",
  "/framework/law-of-one": "Law of One",
  // Account sub-routes
  "/account/support": "Support",
  "/account/topics": "Topics",
  // Admin sub-routes
  "/admin/blog": "Blog Management",
  "/admin/comments": "Comments",
  "/admin/services": "Services",
  "/admin/users": "Users",
  "/admin/accounts": "Accounts",
  "/admin/assessments": "Assessments",
  "/admin/projects": "Projects",
  "/admin/newsletter": "Newsletter",
  "/admin/setup": "Setup",
  "/admin/support": "Support",
  "/admin/team": "Team",
  "/admin/sales": "Sales",
  "/admin/concepts": "Concepts",
  "/admin/image-manager": "Image Manager",
  "/admin/service-categories": "Service Categories",
  // Payment sub-routes
  "/payment/success": "Payment Success",
  // Newsletter sub-routes
  "/newsletter/unsubscribe": "Unsubscribe",
  // Auth sub-routes
  "/auth/error": "Authentication Error",
  "/auth/verification-sent": "Verification Sent",
  "/auth/verify": "Verify Account",
  // User sub-routes
  "/user/error": "User Error",
  "/user/forgot-password": "Forgot Password",
  "/user/reset-password": "Reset Password",
};

// Helper function to format segment labels
const formatSegmentLabel = (segment: string): string => {
  // Handle common URL patterns
  if (segment.includes("-")) {
    return segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Handle camelCase or single words
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

// Helper function to determine if a segment represents a dynamic route
const isDynamicSegment = (segment: string, parentPath: string): boolean => {
  // Check if parent path suggests this is a dynamic route
  const dynamicParents = ["/blog", "/offerings", "/projects", "/assessments", "/premium"];
  const isDynamicParent = dynamicParents.includes(parentPath);

  if (!isDynamicParent) return false;

  // For dynamic parents, any segment that's not a known static route is considered dynamic
  const staticSegments = ["edit", "new", "create", "admin", "category"];
  return !staticSegments.includes(segment);
};

// Generate breadcrumb items from pathname
const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  // Handle root path
  if (pathname === "/") {
    return [{ label: "Home", href: "/", isCurrentPage: true }];
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home
  breadcrumbs.push({ label: "Home", href: "/", isCurrentPage: false });

  // Build breadcrumbs for each segment
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const parentPath = index > 0 ? `/${pathSegments.slice(0, index).join("/")}` : "";

    // Get label from route mapping or format the segment
    let label = ROUTE_LABELS[currentPath];
    if (!label) {
      // Check if this is a dynamic route segment
      if (isDynamicSegment(segment, parentPath)) {
        // For dynamic routes, use a more descriptive label based on the parent
        switch (parentPath) {
          case "/blog":
            label = "Article";
            break;
          case "/offerings":
            label = "Service";
            break;
          case "/projects":
            label = "Project";
            break;
          case "/assessments":
            label = "Assessment";
            break;
          case "/premium":
            label = "Premium Content";
            break;
          default:
            // For other dynamic routes, try to format the segment nicely
            label = formatSegmentLabel(segment);
        }
      } else {
        // For regular routes, format the segment
        label = formatSegmentLabel(segment);
      }
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage: isLast,
    });
  });

  return breadcrumbs;
};

// Breadcrumb component that matches CardNav styling
const CardNavBreadcrumbs: React.FC<{
  baseColor?: string;
  menuColor?: string;
}> = ({ baseColor = "#fff", menuColor = "#000" }) => {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);



  // Don't show breadcrumbs for home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  // Handle long breadcrumb paths by showing ellipsis for middle items
  const displayBreadcrumbs = breadcrumbs.length > 4
    ? [
        breadcrumbs[0], // Home
        { label: "...", href: "", isCurrentPage: false, isEllipsis: true },
        ...breadcrumbs.slice(-2) // Last two items
      ]
    : breadcrumbs;

  return (
    <div
      className="breadcrumb-container px-3 md:px-4 py-2 md:py-3 border-b border-opacity-20 flex-shrink-0"
      style={{
        borderColor: menuColor,
        backgroundColor: baseColor
      }}
    >
      <nav aria-label="Breadcrumb" className="flex items-center justify-center flex-wrap gap-x-1.5 md:gap-x-2 gap-y-1 text-xs md:text-sm max-w-full overflow-hidden">
        {displayBreadcrumbs.map((item, index) => (
          <React.Fragment key={item.href || `ellipsis-${index}`}>
            {index > 0 && (
              <span
                className="breadcrumb-separator opacity-40 text-xs flex-shrink-0"
                style={{ color: menuColor }}
                aria-hidden="true"
              >
                /
              </span>
            )}
            {(item as any).isEllipsis ? (
              <span
                className="breadcrumb-ellipsis opacity-60 text-xs md:text-sm px-1"
                style={{ color: menuColor }}
                aria-hidden="true"
              >
                ...
              </span>
            ) : item.isCurrentPage ? (
              <span
                className="breadcrumb-current font-medium opacity-80 text-xs md:text-sm truncate max-w-[120px] md:max-w-none"
                style={{ color: menuColor }}
                aria-current="page"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="breadcrumb-link transition-all duration-200 hover:opacity-70 hover:underline text-xs md:text-sm font-normal truncate max-w-[100px] md:max-w-none flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-sm px-1 -mx-1"
                style={{
                  color: menuColor,
                  '--tw-ring-color': menuColor
                } as React.CSSProperties}
                title={item.label}
                tabIndex={0}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

const CardNav: React.FC<CardNavProps> = ({
  logoText = "Ishan Parihar",
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#fff",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  showAuthButtons = true,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);

  // Auth hooks
  const { openAuthModal } = useAuthModal();
  const { isLoading, isLoggedIn } = useSession();

  const calculateHeight = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";

        contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }

    // Desktop calculation - base height plus breadcrumb height if present
    const baseHeight = 260;
    const pathname = window.location.pathname;
    const breadcrumbs = generateBreadcrumbs(pathname);
    const hasBreadcrumbs = breadcrumbs.length > 1;
    const breadcrumbHeight = hasBreadcrumbs ? 50 : 0; // Approximate breadcrumb height

    return baseHeight + breadcrumbHeight;
  }, []);

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      "-=0.1",
    );

    return tl;
  }, [calculateHeight, ease]);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items, createTimeline]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded, createTimeline, calculateHeight]);

  // Scroll behavior effect - coordinated with blog navigation
  useEffect(() => {
    // Initialize lastScrollY
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Don't hide if menu is expanded
      if (isExpanded) return;

      // Show header when scrolling up, hide when scrolling down
      const shouldShow = currentScrollY < lastScrollY.current || currentScrollY < 100;

      if (shouldShow !== isVisible) {
        setIsVisible(shouldShow);

        // Coordinate with blog navigation if it exists
        const blogNav = document.querySelector('.blog-navigation-container');
        if (blogNav) {
          const blogNavElement = blogNav as HTMLElement;
          const totalHeight = 220; // Total height: 70px header + 150px blog nav
          const translateY = shouldShow ? '0' : `-${totalHeight}px`; // Hide entire blog nav container
          blogNavElement.style.transform = `translateY(${translateY})`;
          blogNavElement.style.opacity = shouldShow ? '1' : '0';
        }
      }

      lastScrollY.current = currentScrollY;
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [isExpanded, isVisible]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  // Auth button component
  const AuthButton = () => {
    if (!showAuthButtons) return null;

    if (isLoading) {
      return <Skeleton className="w-24 h-8 rounded-none" />;
    }

    if (isLoggedIn) {
      return (
        <Link href="/account">
          <Button
            type="button"
            className="card-nav-cta-button hidden md:inline-flex border-0 rounded-none px-4 h-full font-medium cursor-pointer transition-colors duration-300 text-sm"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          >
            <UserCircle2 className="h-4 w-4 mr-1.5" />
            Account
          </Button>
        </Link>
      );
    }

    return (
      <Button
        type="button"
        className="card-nav-cta-button hidden md:inline-flex border-0 rounded-none px-4 h-full font-medium cursor-pointer transition-colors duration-300 text-sm"
        style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
        onClick={() => openAuthModal("signIn", "/account")}
      >
        <UserCircle2 className="h-4 w-4 mr-1.5" />
        Sign In
      </Button>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`card-nav-container fixed w-[90%] max-w-[800px] z-[1000] ${className}`}
      style={{
        left: '50%',
        top: '0.25rem',
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '-100px'})`,
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.4s ease, opacity 0.4s ease',
        pointerEvents: 'auto' // Always allow pointer events on the nav container
      }}
    >
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""} block h-[60px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height]`}
        style={{ backgroundColor: baseColor }}
      >
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
            style={{ color: menuColor || "#000" }}
          >
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""
              } group-hover:opacity-75`}
            />
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""
              } group-hover:opacity-75`}
            />
          </div>

          <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
            <Link
              href="/"
              className="font-logo text-lg md:text-xl font-normal transition-all duration-300 text-foreground hover:text-primary"
            >
              {logoText}
            </Link>
          </div>

          <AuthButton />
        </div>

        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 flex flex-col items-stretch justify-start z-[1] ${
            isExpanded
              ? "visible pointer-events-auto"
              : "invisible pointer-events-none"
          }`}
          aria-hidden={!isExpanded}
        >
          {/* Breadcrumb Navigation - Only shown when expanded */}
          {isExpanded && (
            <CardNavBreadcrumbs
              baseColor={baseColor}
              menuColor={menuColor}
            />
          )}

          {/* Navigation Cards Container */}
          <div className="nav-cards-container p-2 flex flex-col items-stretch gap-2 md:flex-row md:items-end md:gap-[12px] flex-1">
            {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-none min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">
                {item.label}
              </div>
              <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                {item.links?.map((lnk, i) => (
                  <a
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px]"
                    href={lnk.href}
                    aria-label={lnk.ariaLabel}
                  >
                    <GoArrowUpRight
                      className="nav-card-link-icon shrink-0"
                      aria-hidden="true"
                    />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
