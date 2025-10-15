"use client";

import React from "react";
import { motion } from "framer-motion";

interface FrameworkCardProps {
  name: string;
  description: string;
  keyFrameworks: string[];
  backgroundImageUrl: string;
}

export const FrameworkCard: React.FC<FrameworkCardProps> = ({
  name,
  description,
  keyFrameworks,
  backgroundImageUrl,
}) => {
  return (
    <motion.div
      className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden cursor-pointer group"
      whileHover={{ scale: 1.03 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
        }}
      />

      {/* Base overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Default State - Title Only */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center p-8 md:p-10"
        initial={{ opacity: 1 }}
        whileHover={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="text-center">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-headings leading-tight tracking-tight">
            {name}
          </h3>
        </div>
      </motion.div>

      {/* Hover State - Glassmorphic Overlay with Details */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-lg flex flex-col items-center justify-center p-8 md:p-10 text-center"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Title */}
        <div className="space-y-3 mb-8">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-headings leading-tight tracking-tight">
            {name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-white/90 text-sm md:text-base lg:text-lg mb-8 max-w-md leading-relaxed font-medium">
          {description}
        </p>

        {/* Key Frameworks */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-xs md:text-sm uppercase tracking-wider">
            Key Frameworks
          </h4>
          <div className="flex flex-wrap gap-2 justify-center max-w-sm">
            {keyFrameworks.map((framework, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium border border-white/30"
              >
                {framework}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FrameworkCard;
