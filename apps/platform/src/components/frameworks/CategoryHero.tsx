"use client";

import React from "react";
import { motion } from "framer-motion";

interface CategoryHeroProps {
  title: string;
  description: string;
}

export const CategoryHero: React.FC<CategoryHeroProps> = ({ title, description }) => {
  return (
    <div className="relative w-full min-h-[60vh] flex items-center justify-center py-16 md:py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/50" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-consciousness/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-quantum/10 rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Animated title */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headings text-primary leading-tight tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-primary to-accent-quantum bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h1>

          {/* Animated description */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-secondary max-w-3xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            {description}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default CategoryHero;