"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ProgressTrackerProps {
  totalSections: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ totalSections }) => {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);

  // Track section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionIndex = parseInt(entry.target.getAttribute('data-section-index') || '0');
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(sectionIndex));
          } else {
            setVisibleSections(prev => {
              const newSet = new Set(prev);
              newSet.delete(sectionIndex);
              return newSet;
            });
          }
        });
        
        // Update progress based on visible sections
        setProgress(visibleSections.size / totalSections * 100);
      },
      { 
        threshold: 0.5,
        rootMargin: '0px 0px -20% 0px'
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-section-index]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [totalSections, visibleSections.size]);

  // Don't show progress bar if less than 2 sections viewed
  if (visibleSections.size < 2) return null;

  return (
    <motion.div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-xs text-white/80">Progress</span>
      <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-cyan-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-white/80">{Math.round(progress)}%</span>
    </motion.div>
  );
};