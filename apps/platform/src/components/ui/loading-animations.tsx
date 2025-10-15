"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

// ============================================================================
// CORE LOADING SPINNERS
// ============================================================================

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "accent" | "muted";
}

export function LoadingSpinner({
  size = "md",
  className = "",
  color = "primary",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  const colorClasses = {
    primary:
      "border-neutral-300 border-t-primary dark:border-neutral-700 dark:border-t-white",
    accent:
      "border-neutral-300 border-t-accent dark:border-neutral-700 dark:border-t-accent",
    muted:
      "border-neutral-200 border-t-neutral-500 dark:border-neutral-800 dark:border-t-neutral-400",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Elegant pulsing dots loader
export function PulsingDots({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center space-x-1", className)}
      role="status"
      aria-label="Loading"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: "#0FA4AF",
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: "0s",
        }}
      />
      <div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: "#0FA4AF",
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: "0.2s",
        }}
      />
      <div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: "#0FA4AF",
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: "0.4s",
        }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Sophisticated wave loader
export function WaveLoader({ className = "" }: { className?: string }) {
  const waveKeyframes = `
    @keyframes wave-animation {
      0%, 40%, 100% {
        transform: scaleY(0.4);
        opacity: 0.7;
      }
      20% {
        transform: scaleY(1);
        opacity: 1;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: waveKeyframes }} />
      <div
        className={cn(
          "flex items-center justify-center items-end space-x-1",
          className,
        )}
        role="status"
        aria-label="Loading"
      >
        <div
          className="w-1 rounded-full"
          style={{
            height: "20px",
            backgroundColor: "#0FA4AF",
            animation: "wave-animation 1.2s ease-in-out infinite",
            animationDelay: "0s",
            transformOrigin: "bottom",
          }}
        />
        <div
          className="w-1 rounded-full"
          style={{
            height: "20px",
            backgroundColor: "#0FA4AF",
            animation: "wave-animation 1.2s ease-in-out infinite",
            animationDelay: "0.1s",
            transformOrigin: "bottom",
          }}
        />
        <div
          className="w-1 rounded-full"
          style={{
            height: "20px",
            backgroundColor: "#0FA4AF",
            animation: "wave-animation 1.2s ease-in-out infinite",
            animationDelay: "0.2s",
            transformOrigin: "bottom",
          }}
        />
        <div
          className="w-1 rounded-full"
          style={{
            height: "20px",
            backgroundColor: "#0FA4AF",
            animation: "wave-animation 1.2s ease-in-out infinite",
            animationDelay: "0.3s",
            transformOrigin: "bottom",
          }}
        />
        <div
          className="w-1 rounded-full"
          style={{
            height: "20px",
            backgroundColor: "#0FA4AF",
            animation: "wave-animation 1.2s ease-in-out infinite",
            animationDelay: "0.4s",
            transformOrigin: "bottom",
          }}
        />
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}

// ============================================================================
// SKELETON LOADERS
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "rounded";
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  animation = "pulse",
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-none",
    circular: "rounded-full",
    rounded: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-wave",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-neutral-200 dark:bg-neutral-700",
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Blog card skeleton
export function BlogCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none overflow-hidden",
        className,
      )}
    >
      <Skeleton className="h-48 w-full" variant="rectangular" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" variant="text" />
          <Skeleton className="h-3 w-4/5" variant="text" />
          <Skeleton className="h-3 w-2/3" variant="text" />
        </div>
        <div className="flex items-center space-x-4 pt-2">
          <Skeleton className="h-8 w-8" variant="circular" />
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
      </div>
    </div>
  );
}

// Navigation skeleton
export function NavigationSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-6", className)}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-4 w-16" variant="text" />
      ))}
    </div>
  );
}

// Page content skeleton
export function PageContentSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <Skeleton className="h-8 w-2/3" variant="text" />
      <Skeleton className="h-4 w-1/3" variant="text" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-5/6" variant="text" />
        <Skeleton className="h-4 w-4/5" variant="text" />
      </div>
      <Skeleton className="h-64 w-full" variant="rectangular" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
      </div>
    </div>
  );
}

// ============================================================================
// PAGE TRANSITION ANIMATIONS
// ============================================================================

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

export function FadeTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

export function SlideUpTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// LOADING OVERLAYS
// ============================================================================

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  spinner?: "default" | "dots" | "wave";
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = "Loading...",
  spinner = "default",
  className = "",
}: LoadingOverlayProps) {
  const renderSpinner = () => {
    switch (spinner) {
      case "dots":
        return <PulsingDots />;
      case "wave":
        return <WaveLoader />;
      default:
        return <LoadingSpinner size="lg" color="accent" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-white/80 dark:bg-neutral-900/80",
            "backdrop-blur-sm",
            className,
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center space-y-4 p-8 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg"
          >
            {renderSpinner()}
            <p className="text-neutral-600 dark:text-neutral-400 font-ui text-sm">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Inline loading state
export function InlineLoader({
  message = "Loading...",
  spinner = "default",
  className = "",
}: Omit<LoadingOverlayProps, "isVisible">) {
  const renderSpinner = () => {
    switch (spinner) {
      case "dots":
        return <PulsingDots className="mb-4" />;
      case "wave":
        return <WaveLoader className="mb-4" />;
      default:
        return <LoadingSpinner size="md" color="accent" className="mb-4" />;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 min-h-[160px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg",
        className,
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        {renderSpinner()}
        <span className="text-neutral-600 dark:text-neutral-400 font-ui text-sm text-center max-w-xs">
          {message}
        </span>
      </div>
    </div>
  );
}
