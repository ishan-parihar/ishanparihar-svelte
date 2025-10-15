"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

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

const variants = {
  hidden: {
    opacity: 0,
    y: 0,
    x: 0,
    scale: 1,
  },
  fadeIn: {
    opacity: 1,
  },
  fadeInUp: {
    opacity: 1,
    y: 0,
  },
  fadeInDown: {
    opacity: 1,
    y: 0,
  },
  fadeInLeft: {
    opacity: 1,
    x: 0,
  },
  fadeInRight: {
    opacity: 1,
    x: 0,
  },
  zoomIn: {
    opacity: 1,
    scale: 1,
  },
  cosmicReveal: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ease: [0.25, 0.1, 0.25, 1.0],
      duration: 1.2,
    },
  },
  cosmicPulse: {
    opacity: 1,
    scale: 1,
    transition: {
      ease: [0.25, 0.1, 0.25, 1.0],
      duration: 1.5,
    },
  },
  cosmicShimmer: {
    opacity: 1,
    filter: "brightness(1) contrast(1)",
    textShadow: "0 0 0px rgba(14, 165, 233, 0)",
    boxShadow: "0 0 0px rgba(14, 165, 233, 0)",
    transition: {
      ease: [0.25, 0.1, 0.25, 1.0],
      duration: 1.8,
    },
  },
  cosmicSlide: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      ease: [0.23, 1, 0.32, 1], // Elegant cubic bezier
      duration: 1.2,
    },
  },
  premiumFade: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      opacity: { duration: 0.8, ease: [0.23, 1, 0.32, 1] },
      y: { duration: 1.2, ease: [0.23, 1, 0.32, 1] },
      filter: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
    },
  },
};

const getInitialState = (variant: AnimationVariant) => {
  switch (variant) {
    case "fadeInUp":
      return { ...variants.hidden, y: 50 };
    case "fadeInDown":
      return { ...variants.hidden, y: -50 };
    case "fadeInLeft":
      return { ...variants.hidden, x: 100 };
    case "fadeInRight":
      return { ...variants.hidden, x: -100 };
    case "zoomIn":
      return { ...variants.hidden, scale: 0.8 };
    case "cosmicReveal":
      return { ...variants.hidden, scale: 0.95, filter: "blur(10px)" };
    case "cosmicPulse":
      return { ...variants.hidden, scale: 0.9 };
    case "cosmicShimmer":
      return {
        ...variants.hidden,
        filter: "brightness(1.4) contrast(1.2)",
        textShadow: "0 0 15px rgba(14, 165, 233, 0.8)",
        boxShadow: "0 0 25px rgba(14, 165, 233, 0.8)",
      };
    case "cosmicSlide":
      return { ...variants.hidden, x: -20, y: 20, scale: 0.98 };
    case "premiumFade":
      return { ...variants.hidden, y: 30, filter: "blur(5px)" };
    default:
      return variants.hidden;
  }
};

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = "fadeIn",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = "",
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "10px",
      },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  const initialState = getInitialState(variant);

  // Skip animation for users who prefer reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? { opacity: 1 } : initialState}
      animate={
        isVisible || prefersReducedMotion ? variants[variant] : initialState
      }
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
