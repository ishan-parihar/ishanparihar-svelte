"use client";

import React from "react";
import { motion } from "framer-motion";

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = "",
  onClick,
  disabled = false,
}) => {
  return (
    <motion.div
      className={`${className} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.03,
              y: -2,
              transition: {
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1] as const,
              },
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.995,
              y: 0,
              transition: {
                duration: 0.1,
                ease: [0.22, 1, 0.36, 1] as const,
              },
            }
      }
      onClick={disabled ? undefined : onClick}
      style={{
        transformOrigin: "center",
      }}
    >
      {children}
    </motion.div>
  );
};

// Button variant with more pronounced feedback
export const InteractiveButton: React.FC<InteractiveCardProps> = ({
  children,
  className = "",
  onClick,
  disabled = false,
}) => {
  return (
    <motion.button
      className={className}
      disabled={disabled}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.05,
              transition: { duration: 0.2 },
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.95,
              transition: { duration: 0.1 },
            }
      }
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};
