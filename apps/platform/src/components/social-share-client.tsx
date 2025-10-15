"use client";

import { Twitter, Facebook, Linkedin, Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSocialShare } from "@/hooks/useSocialShare";

interface SocialShareClientProps {
  title: string;
  slug: string;
}

export function SocialShareClient({ title, slug }: SocialShareClientProps) {
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

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2">
        {/* Copy link button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className={`share-btn copy-btn ${copied ? "copied" : ""} w-7 h-7 rounded-none`}
              aria-label="Copy link"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{copied ? "Copied!" : "Copy Link"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={shareOnTwitter}
              className="share-btn twitter-btn w-7 h-7 rounded-none"
              aria-label="Share on Twitter"
            >
              <Twitter size={12} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Twitter</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={shareOnFacebook}
              className="share-btn facebook-btn w-7 h-7 rounded-none"
              aria-label="Share on Facebook"
            >
              <Facebook size={12} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Facebook</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={shareOnLinkedIn}
              className="share-btn linkedin-btn w-7 h-7 rounded-none"
              aria-label="Share on LinkedIn"
            >
              <Linkedin size={12} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>LinkedIn</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
