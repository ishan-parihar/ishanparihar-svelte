"use client";

import React, { useState } from "react";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  X,
} from "lucide-react";
import { useSocialShare } from "@/hooks/useSocialShare";

interface MobileBottomBarClientProps {
  title: string;
  slug: string;
}

export function MobileBottomBarClient({
  title,
  slug,
}: MobileBottomBarClientProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const {
    shareOnTwitter,
    shareOnFacebook,
    shareOnLinkedIn,
    copyToClipboard,
    copied,
  } = useSocialShare({
    title,
    slug,
  });

  // Close share panel
  const closeSharePanel = () => {
    setIsShareOpen(false);
  };

  return (
    <>
      {/* Overlay to close panels when clicking outside */}
      {isShareOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={closeSharePanel}
        />
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/30 shadow-lg z-50 lg:hidden">
        <div className="flex justify-around items-center h-14">
          {/* Share Button - now full width */}
          <button
            className="flex flex-col items-center justify-center w-full h-full text-sm font-medium"
            onClick={() => {
              setIsShareOpen(!isShareOpen);
            }}
          >
            <Share2 className="h-5 w-5 mb-0.5 text-primary" />
            <span>Share Article</span>
          </button>
        </div>

        {/* Share Panel */}
        {isShareOpen && (
          <div className="absolute bottom-14 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/30 p-4 rounded-t-xl shadow-lg">
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
          </div>
        )}
      </div>

      {/* Add padding to the bottom of the page to account for the fixed bar */}
      <div className="h-14 w-full lg:hidden"></div>
    </>
  );
}
