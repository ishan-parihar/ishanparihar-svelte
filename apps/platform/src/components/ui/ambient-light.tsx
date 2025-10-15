"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface AmbientLightProps {
  color?: string;
  intensity?: number;
  size?: number;
  speed?: number;
  className?: string;
}

export const AmbientLight: React.FC<AmbientLightProps> = ({ 
  color = "rgba(0, 255, 255, 0.1)", 
  intensity = 0.1,
  size = 300,
  speed = 0.5,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: intensity,
        }}
        animate={{
          x: [0, 50, 0, -50, 0],
          y: [0, -50, 0, 50, 0],
        }}
        transition={{
          duration: 20 / speed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${size * 0.7}px`,
          height: `${size * 0.7}px`,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          top: "30%",
          left: "70%",
          opacity: intensity * 0.7,
        }}
        animate={{
          x: [0, -30, 0, 30, 0],
          y: [0, 40, 0, -40, 0],
        }}
        transition={{
          duration: 25 / speed,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${size * 0.5}px`,
          height: `${size * 0.5}px`,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          top: "70%",
          left: "30%",
          opacity: intensity * 0.5,
        }}
        animate={{
          x: [0, 40, 0, -40, 0],
          y: [0, -30, 0, 30, 0],
        }}
        transition={{
          duration: 30 / speed,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
};