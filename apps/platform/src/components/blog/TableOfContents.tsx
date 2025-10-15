"use client";

import { useState, useEffect, useRef } from "react";

interface Heading {
  text: string;
  displayText?: string; // Optional cleaned text for display
  slug: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const tocRef = useRef<HTMLDivElement>(null);

  // Filter headings to focus on h2 and h3 as specified in requirements
  const filteredHeadings = headings.filter(
    (heading) => heading.level === 2 || heading.level === 3,
  );

  // Set up intersection observer to highlight active section
  useEffect(() => {
    if (filteredHeadings.length === 0 || typeof window === "undefined") return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the first visible heading
      const visibleHeadings = entries.filter((entry) => entry.isIntersecting);

      if (visibleHeadings.length > 0) {
        // Get the ID of the first visible heading
        const firstVisibleHeading = visibleHeadings[0];
        const id = firstVisibleHeading.target.id;

        if (id) {
          setActiveId(id);
        }
      }
    };

    // Get header height for better observer margin calculation
    const header = document.querySelector("header");
    const headerHeight = header ? header.getBoundingClientRect().height : 70;

    const observerOptions = {
      rootMargin: `-${headerHeight + 20}px 0px -40% 0px`, // Account for header height plus some padding
      threshold: 0,
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    // Observe all filtered headings
    filteredHeadings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredHeadings]);

  // Handle TOC item click with improved scroll calculation
  const handleTocClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) => {
    event.preventDefault();
    const targetElement = document.getElementById(slug);

    if (targetElement) {
      // Get all sticky elements that affect scrolling
      const header = document.querySelector("header");
      const blogNav = document.querySelector(".blog-nav");

      // Calculate the total height of sticky elements
      const headerHeight = header ? header.getBoundingClientRect().height : 70; // Default to 70px if not found
      const blogNavHeight = blogNav
        ? blogNav.getBoundingClientRect().height
        : 0;
      const additionalOffset = 24; // Extra space for better readability
      const totalOffset = headerHeight + blogNavHeight + additionalOffset;

      // Get element position
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - totalOffset;

      // Log the scroll position for debugging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log("TOC: Scrolling to element:", {
          element: slug,
          elementPosition,
          windowScrollY: window.scrollY,
          offsetPosition,
          headerHeight,
          blogNavHeight,
          totalOffset,
        });
      }

      // Smooth scroll to the element with the correct offset
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Update URL hash without causing a jump or adding to history stack
      // Use replaceState instead of pushState to avoid creating new history entries
      // This ensures the back button returns to the previous page, not previous heading links
      if (window.history.replaceState) {
        window.history.replaceState(null, "", `#${slug}`);
      }

      // Update active ID
      setActiveId(slug);
    } else {
      console.warn(`TOC: Element with id "${slug}" not found`);
    }
  };

  return (
    <div
      className="toc-container border bg-card rounded-lg overflow-hidden shadow-lg"
      ref={tocRef}
    >
      <div className="py-2.5 px-3 flex items-center justify-center border-b border-border toc-header bg-transparent">
        <h3 className="text-sm font-medium text-foreground">
          Table of Contents
        </h3>
      </div>

      <div className="py-2 px-2 toc-list bg-transparent max-h-[300px] overflow-y-auto scrollbar-thin">
        {filteredHeadings.length > 0 ? (
          <ul className="space-y-0.5">
            {filteredHeadings.map((heading) => (
              <li
                key={heading.slug}
                style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
                className={`text-sm level-${heading.level}`}
                data-heading-level={heading.level}
              >
                <a
                  href={`#${heading.slug}`}
                  onClick={(e) => handleTocClick(e, heading.slug)}
                  className={`
                    flex items-center gap-0.5 py-1
                    hover:bg-muted transition-colors
                    w-full text-left px-1.5 rounded-none
                    ${activeId === heading.slug ? "text-foreground font-medium" : "text-muted-foreground"}
                  `}
                >
                  {/* Level indicator dot */}
                  <span
                    className={`
                      mr-1
                      ${heading.level === 2 ? "w-1.25 h-1.25" : "w-1 h-1"}
                      rounded-none bg-foreground/70 inline-block flex-shrink-0
                    `}
                  ></span>

                  {/* Heading text */}
                  <span className="heading-text">
                    {heading.displayText || heading.text}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-2 text-sm text-muted-foreground">
            No headings found
          </div>
        )}
      </div>
    </div>
  );
}
