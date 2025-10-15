"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface FocusEnhancerProps {
  children: React.ReactNode;
  intensity?: number;
}

export const FocusEnhancer: React.FC<FocusEnhancerProps> = ({ 
  children, 
  intensity = 1 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(springY, [0, 1], [intensity * 2, -intensity * 2]);
  const rotateY = useTransform(springX, [0, 1], [-intensity * 2, intensity * 2]);
  const glowOpacity = useTransform(springX, [0, 0.5, 1], [0.1, 0.3, 0.1]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isFocused) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseEnter = () => setIsFocused(true);
    const handleMouseLeave = () => {
      setIsFocused(false);
      mouseX.set(0.5);
      mouseY.set(0.5);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isFocused, mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{
            background: "radial-gradient(600px circle at center, rgba(0, 255, 255, 0.15) 0%, transparent 80%)",
            opacity: glowOpacity,
            transform: "translateZ(10px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
};