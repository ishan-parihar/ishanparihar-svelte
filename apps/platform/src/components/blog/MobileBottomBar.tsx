"use client";

import React, { useState } from "react";
import {
  Layers,
  Share2,
  ChevronUp,
  Maximize2,
  Minimize2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  toggleHeadingsByLevel,
  toggleAllHeadings,
} from "../toggleable-heading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSocialShare } from "@/hooks/useSocialShare";

interface MobileBottomBarProps {
  title: string;
  slug: string;
}

export function MobileBottomBar({ title, slug }: MobileBottomBarProps) {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState({
    h1: true,
    h2: true,
    h3: true,
  });
  const [allExpanded, setAllExpanded] = useState(true);

  const {
    shareOnTwitter,
    shareOnFacebook,
    shareOnLinkedIn,
    copyToClipboard,
    nativeShare,
    copied,
  } = useSocialShare({
    title,
    slug,
  });

  // Toggle functions
  const toggleAll = () => {
    const newState = !allExpanded;

    // Update local state
    setAllExpanded(newState);
    setExpandedLevels({
      h1: newState,
      h2: newState,
      h3: newState,
    });

    // Toggle all headings
    toggleAllHeadings(newState);

    // Make sure to toggle each level individually as well to ensure complete synchronization
    for (let i = 1; i <= 3; i++) {
      toggleHeadingsByLevel(i, newState);
    }
  };

  const toggleLevel = (level: number) => {
    const levelKey = `h${level}` as keyof typeof expandedLevels;
    const newState = !expandedLevels[levelKey];

    // Update local state
    setExpandedLevels((prev) => ({
      ...prev,
      [levelKey]: newState,
    }));

    // Toggle headings at this level
    toggleHeadingsByLevel(level, newState);

    // Update all expanded state
    if (!newState) {
      setAllExpanded(false);
    } else {
      // Only set allExpanded to true if all other levels are also expanded
      const newExpandedLevels = {
        ...expandedLevels,
        [levelKey]: newState,
      };

      setAllExpanded(
        newExpandedLevels.h1 && newExpandedLevels.h2 && newExpandedLevels.h3,
      );
    }
  };

  // Close all panels
  const closeAllPanels = () => {
    setIsToggleOpen(false);
    setIsShareOpen(false);
  };

  return (
    <>
      {/* Overlay to close panels when clicking outside */}
      {(isToggleOpen || isShareOpen) && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={closeAllPanels}
        />
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/30 shadow-lg z-50 lg:hidden">
        <div className="flex justify-around items-center h-14">
          {/* Toggle Sections Button */}
          <button
            className="flex flex-col items-center justify-center w-1/2 h-full text-sm font-medium"
            onClick={() => {
              setIsToggleOpen(!isToggleOpen);
              setIsShareOpen(false);
            }}
          >
            <Layers className="h-5 w-5 mb-0.5 text-primary" />
            <span>Toggle Sections</span>
          </button>

          {/* Share Button */}
          <button
            className="flex flex-col items-center justify-center w-1/2 h-full text-sm font-medium"
            onClick={() => {
              setIsShareOpen(!isShareOpen);
              setIsToggleOpen(false);
            }}
          >
            <Share2 className="h-5 w-5 mb-0.5 text-primary" />
            <span>Share Article</span>
          </button>
        </div>

        {/* Toggle Panel */}
        <AnimatePresence>
          {isToggleOpen && (
            <motion.div
              className="absolute bottom-14 left-0 right-0 bg-card border-t border-border/30 p-4 rounded-t-xl shadow-lg"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" />
                  Toggle Sections
                </h3>
                <button
                  onClick={() => setIsToggleOpen(false)}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={toggleAll}
                  className={`toggle-button flex items-center justify-center gap-2 py-3 px-4 rounded-none border ${
                    allExpanded
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border/50"
                  }`}
                >
                  {allExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
                </button>

                <button
                  onClick={() => toggleLevel(1)}
                  className={`toggle-button flex items-center justify-center gap-2 py-3 px-4 rounded-none border ${
                    expandedLevels.h1
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border/50"
                  }`}
                >
                  <span>H1 Headings</span>
                </button>

                <button
                  onClick={() => toggleLevel(2)}
                  className={`toggle-button flex items-center justify-center gap-2 py-3 px-4 rounded-none border ${
                    expandedLevels.h2
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border/50"
                  }`}
                >
                  <span>H2 Headings</span>
                </button>

                <button
                  onClick={() => toggleLevel(3)}
                  className={`toggle-button flex items-center justify-center gap-2 py-3 px-4 rounded-none border ${
                    expandedLevels.h3
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border/50"
                  }`}
                >
                  <span>H3 Headings</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Panel */}
        <AnimatePresence>
          {isShareOpen && (
            <motion.div
              className="absolute bottom-14 left-0 right-0 bg-card border-t border-border/30 p-4 rounded-t-xl shadow-lg"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-primary" />
                  Share Article
                </h3>
                <button
                  onClick={() => setIsShareOpen(false)}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-none border bg-muted border-border/50 hover:bg-muted/80"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>

                <button
                  onClick={shareOnTwitter}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-none border bg-[#1da1f2] text-white border-[#1da1f2]/50 hover:bg-[#1a94df]"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </button>

                <button
                  onClick={shareOnFacebook}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-none border bg-[#1877f2] text-white border-[#1877f2]/50 hover:bg-[#166fe0]"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-none border bg-[#0077b5] text-white border-[#0077b5]/50 hover:bg-[#006aa3]"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add padding to the bottom of the page to account for the fixed bar */}
      <div className="h-14 w-full lg:hidden"></div>
    </>
  );
}
