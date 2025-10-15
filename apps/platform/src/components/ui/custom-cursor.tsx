"use client";

import React, { useEffect } from "react";
import { useCursor } from "@/providers/cursor-provider";

interface CustomCursorProps {
  variant?: string;
  text?: string;
  children: React.ReactNode;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ 
  variant = "hover", 
  text = "",
  children 
}) => {
  const { setCursorVariant, setCursorText } = useCursor();

  useEffect(() => {
    const handleMouseEnter = () => {
      setCursorVariant(variant);
      if (text) setCursorText(text);
    };

    const handleMouseLeave = () => {
      setCursorVariant("default");
      setCursorText("");
    };

    // Add event listeners to the parent element
    const parentElement = document.currentScript?.parentElement;
    if (parentElement) {
      parentElement.addEventListener("mouseenter", handleMouseEnter);
      parentElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        parentElement.removeEventListener("mouseenter", handleMouseEnter);
        parentElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [variant, text, setCursorVariant, setCursorText]);

  return <>{children}</>;
};

// Specific cursor components for different interactions
export const HoverCursor: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CustomCursor variant="hover">{children}</CustomCursor>
);

export const ClickCursor: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CustomCursor variant="click">{children}</CustomCursor>
);

export const TextCursor: React.FC<{ text: string; children: React.ReactNode }> = ({ 
  text, 
  children 
}) => (
  <CustomCursor variant="text" text={text}>{children}</CustomCursor>
);