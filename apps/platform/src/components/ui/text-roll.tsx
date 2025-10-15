"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  onAnimationComplete?: () => void;
};

export function TextRoll({
  children,
  duration = 0.8,
  getEnterDelay = (i) => i * 0.05,
  getExitDelay = (i) => i * 0.05,
  className,
  onAnimationComplete,
}: TextRollProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const letters = children.split("");

  return (
    <span className={className}>
      {letters.map((letter, i) => {
        return (
          <motion.span
            key={i}
            className="inline-block"
            initial={{
              opacity: 0,
              y: 50,
              rotateX: -90,
            }}
            animate={
              isVisible
                ? {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                  }
                : {}
            }
            transition={{
              duration,
              delay: getEnterDelay(i),
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            onAnimationComplete={
              letters.length === i + 1 ? onAnimationComplete : undefined
            }
            style={{
              transformOrigin: "50% 50%",
              perspective: "1000px",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        );
      })}
      <span className="sr-only">{children}</span>
    </span>
  );
}

// Alternative simpler animation
export function SimpleTextReveal({
  children,
  className,
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
    >
      {children}
    </motion.span>
  );
}
