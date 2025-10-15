"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface CursorContextType {
  cursorVariant: string;
  setCursorVariant: (variant: string) => void;
  cursorText: string;
  setCursorText: (text: string) => void;
}

const CursorContext = createContext<CursorContextType | null>(null);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorVariant, setCursorVariant] = useState("default");
  const [cursorText, setCursorText] = useState("");
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const followerX = useRef(0);
  const followerY = useRef(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0)`;
      }
    };

    const animateFollower = () => {
      if (cursorFollowerRef.current) {
        // Smooth follow animation
        followerX.current += (mouseX.current - followerX.current) / 8;
        followerY.current += (mouseY.current - followerY.current) / 8;
        
        cursorFollowerRef.current.style.transform = `translate3d(${followerX.current}px, ${followerY.current}px, 0)`;
      }
      
      requestRef.current = requestAnimationFrame(animateFollower);
    };

    window.addEventListener("mousemove", handleMouseMove);
    requestRef.current = requestAnimationFrame(animateFollower);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Update cursor styles based on variant
  useEffect(() => {
    if (cursorRef.current && cursorFollowerRef.current) {
      switch (cursorVariant) {
        case "hover":
          cursorRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) scale(2)`;
          cursorFollowerRef.current.style.transform = `translate3d(${followerX.current}px, ${followerY.current}px, 0) scale(2)`;
          cursorFollowerRef.current.style.backgroundColor = "rgba(0, 255, 255, 0.2)";
          break;
        case "click":
          cursorRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) scale(0.8)`;
          cursorFollowerRef.current.style.transform = `translate3d(${followerX.current}px, ${followerY.current}px, 0) scale(0.8)`;
          cursorFollowerRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
          break;
        case "text":
          cursorRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) scale(1.5)`;
          cursorFollowerRef.current.style.transform = `translate3d(${followerX.current}px, ${followerY.current}px, 0) scale(1.5)`;
          cursorFollowerRef.current.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          break;
        default:
          cursorRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) scale(1)`;
          cursorFollowerRef.current.style.transform = `translate3d(${followerX.current}px, ${followerY.current}px, 0) scale(1)`;
          cursorFollowerRef.current.style.backgroundColor = "rgba(0, 255, 255, 0.1)";
      }
    }
  }, [cursorVariant]);

  return (
    <CursorContext.Provider value={{ 
      cursorVariant, 
      setCursorVariant,
      cursorText,
      setCursorText
    }}>
      {children}
      {/* Custom cursor elements */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out"
        style={{ 
          transform: "translate3d(0, 0, 0)",
          transition: "transform 0.1s ease-out"
        }}
      />
      <div 
        ref={cursorFollowerRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998] mix-blend-difference transition-all duration-300 ease-out"
        style={{ 
          transform: "translate3d(0, 0, 0)",
          backgroundColor: "rgba(0, 255, 255, 0.1)",
          transition: "transform 0.3s ease-out, background-color 0.3s ease-out"
        }}
      >
        {cursorText && (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
            {cursorText}
          </span>
        )}
      </div>
    </CursorContext.Provider>
  );
};