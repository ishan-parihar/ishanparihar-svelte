"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ============================================================================
// SCROLL REVEAL COMPONENT
// ============================================================================

type AnimationVariant =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "zoomIn"
  | "cosmicReveal"
  | "cosmicPulse"
  | "cosmicShimmer"
  | "cosmicSlide"
  | "premiumFade";

type ScrollRevealProps = {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
};

const getVariants = (variant: AnimationVariant) => {
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    },
    fadeInDown: {
      hidden: { opacity: 0, y: -30 },
      visible: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -30 },
      visible: { opacity: 1, x: 0 },
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 30 },
      visible: { opacity: 1, x: 0 },
    },
    zoomIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    cosmicReveal: {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
    },
    cosmicPulse: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
    cosmicShimmer: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    cosmicSlide: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
    premiumFade: {
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0 },
    },
  };

  return variants[variant] || variants.fadeIn;
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = "fadeInUp",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = "",
  once = true,
}) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: once,
  });

  const variants = getVariants(variant);

  // Skip animation for users who prefer reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? variants.visible : variants.hidden}
      animate={
        inView || prefersReducedMotion ? variants.visible : variants.hidden
      }
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// STAGGERED LIST COMPONENT
// ============================================================================

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
  once?: boolean;
  variant?: AnimationVariant;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className = "",
  staggerDelay = 0.1,
  threshold = 0.1,
  once = true,
  variant = "fadeInUp",
}) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: once,
  });

  const variants = getVariants(variant);

  // Skip animation for users who prefer reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: variants.hidden,
    visible: variants.visible,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={prefersReducedMotion ? {} : containerVariants}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      animate={inView || prefersReducedMotion ? "visible" : "hidden"}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={prefersReducedMotion ? {} : itemVariants}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

const LightweightAnimations = {
  ScrollReveal,
  StaggeredList,
};

export default LightweightAnimations;
