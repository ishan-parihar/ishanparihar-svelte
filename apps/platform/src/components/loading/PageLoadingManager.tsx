"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { usePageLoading } from "@/contexts/LoadingContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LoadingSpinner,
  PulsingDots,
} from "@/components/ui/loading-animations";

// ============================================================================
// PAGE LOADING MANAGER
// ============================================================================

function PageLoadingManagerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setLoading } = usePageLoading();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Start loading when route changes
    setIsNavigating(true);
    setLoading(true, "Loading page...", "default");

    // Simulate minimum loading time for better UX
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [pathname, searchParams, setLoading]);

  return null; // This component only manages state
}

export function PageLoadingManager() {
  return (
    <Suspense fallback={null}>
      <PageLoadingManagerInner />
    </Suspense>
  );
}

// ============================================================================
// NAVIGATION LOADING INDICATOR
// ============================================================================

interface NavigationLoadingProps {
  className?: string;
}

function NavigationLoadingIndicatorInner({
  className = "",
}: NavigationLoadingProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left ${className}`}
        />
      )}
    </AnimatePresence>
  );
}

export function NavigationLoadingIndicator({
  className = "",
}: NavigationLoadingProps) {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingIndicatorInner className={className} />
    </Suspense>
  );
}

// ============================================================================
// ROUTE LOADING WRAPPER
// ============================================================================

interface RouteLoadingWrapperProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  minLoadingTime?: number;
}

function RouteLoadingWrapperInner({
  children,
  loadingComponent,
  minLoadingTime = 200,
}: RouteLoadingWrapperProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setShowContent(false);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, minLoadingTime]);

  const defaultLoadingComponent = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" color="accent" />
        <p className="text-neutral-600 dark:text-neutral-400 font-ui">
          Loading page...
        </p>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {loadingComponent || defaultLoadingComponent}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function RouteLoadingWrapper({
  children,
  loadingComponent,
  minLoadingTime = 200,
}: RouteLoadingWrapperProps) {
  return (
    <Suspense fallback={loadingComponent || <div>Loading...</div>}>
      <RouteLoadingWrapperInner
        loadingComponent={loadingComponent}
        minLoadingTime={minLoadingTime}
      >
        {children}
      </RouteLoadingWrapperInner>
    </Suspense>
  );
}

// ============================================================================
// HEADER LOADING INDICATOR
// ============================================================================

function HeaderLoadingIndicatorInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 h-0.5 bg-accent"
        />
      )}
    </AnimatePresence>
  );
}

export function HeaderLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <HeaderLoadingIndicatorInner />
    </Suspense>
  );
}

// ============================================================================
// LINK LOADING WRAPPER
// ============================================================================

interface LinkLoadingWrapperProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  showIndicator?: boolean;
}

export function LinkLoadingWrapper({
  children,
  href,
  className = "",
  showIndicator = true,
}: LinkLoadingWrapperProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (showIndicator) {
      setIsClicked(true);
      // Reset after a delay, assuming navigation will start
      setTimeout(() => setIsClicked(false), 1500);
    }
  };

  return (
    <Link href={href} className={`relative ${className}`} onClick={handleClick}>
      {children}

      {showIndicator && isClicked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 rounded-none z-10"
        >
          <PulsingDots className="scale-75" />
        </motion.div>
      )}
    </Link>
  );
}

// ============================================================================
// SECTION LOADING WRAPPER
// ============================================================================

interface SectionLoadingWrapperProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingHeight?: string;
  className?: string;
}

export function SectionLoadingWrapper({
  children,
  isLoading,
  loadingHeight = "h-64",
  className = "",
}: SectionLoadingWrapperProps) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${loadingHeight} flex flex-col items-center justify-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg`}
          >
            <LoadingSpinner size="lg" color="accent" className="mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 text-sm font-ui text-center">
              Loading content...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
