"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationEffectProps {
  isActive: boolean;
  onComplete?: () => void;
  type?: "confetti" | "sparkles" | "pulse";
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ 
  isActive, 
  onComplete,
  type = "confetti"
}) => {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, color: string}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      const newParticles = [];
      const colors = ["#00ffff", "#ffffff", "#7dd3fc", "#c084fc", "#f87171"];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setParticles(newParticles);
      
      // Auto-clear after animation
      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              y: 0,
              x: 0,
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -100],
              x: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Center pulse effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full"
        initial={{ 
          opacity: 0,
          scale: 0,
          x: "-50%",
          y: "-50%",
        }}
        animate={{ 
          opacity: [0, 0.5, 0],
          scale: [0, 2, 3],
        }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
        }}
        style={{
          backgroundColor: "rgba(0, 255, 255, 0.2)",
        }}
      />
    </div>
  );
};

// Hook for managing celebration effects
export const useCelebration = () => {
  const [isActive, setIsActive] = useState(false);
  
  const triggerCelebration = () => {
    setIsActive(true);
  };
  
  const resetCelebration = () => {
    setIsActive(false);
  };
  
  return {
    isActive,
    triggerCelebration,
    resetCelebration
  };
};