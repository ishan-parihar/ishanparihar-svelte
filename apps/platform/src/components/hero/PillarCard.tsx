// src/components/hero/PillarCard.tsx
import React, { useState, useRef } from "react";

interface PillarCardProps {
  benefit: string;
  methodology: string;
}

const PillarCard: React.FC<PillarCardProps> = ({ benefit, methodology }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="relative bg-slate-800/50 backdrop-blur-lg border border-slate-700 transition-all duration-300 p-2 text-center overflow-hidden rounded-none shadow-lg transform group cursor-pointer"
      style={{
        border: isHovered ? '1px solid #00ffff' : '1px solid #334155',
        boxShadow: isHovered 
          ? '0 0 15px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.3)' 
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        transform: isHovered ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight effect */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 255, 0.15), transparent 40%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />
      
      {/* Benefit text */}
      <h3 
        className="text-cyan-400 text-base font-semibold tracking-wide m-0 leading-tight"
        style={{
          textShadow: isHovered ? '0 0 8px rgba(0, 255, 255, 0.7)' : 'none',
          animation: isHovered ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        {benefit}
      </h3>
      
      {/* Methodology text (shown on hover) */}
      <p 
        className="text-slate-300 text-sm mt-1 mb-0 transition-all duration-300 absolute inset-0 flex items-center justify-center p-2 bg-slate-800/90 rounded-none"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        {methodology}
      </p>
    </div>
  );
};

export default PillarCard;