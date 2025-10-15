import React from "react";
import { Share2 } from "lucide-react";
import { SocialShareClient } from "./social-share-client";

interface SocialShareServerProps {
  title: string;
  slug: string;
}

export function SocialShareServer({ title, slug }: SocialShareServerProps) {
  return (
    <div className="share-container bg-transparent overflow-hidden shadow-sm border border-border/30">
      <div className="py-3 px-5 flex items-center justify-between border-b border-border/20">
        <div className="flex items-center gap-1.5">
          <Share2 size={14} className="text-foreground" />
          <span className="text-sm font-medium">Share Article</span>
        </div>

        {/* Client component for interactivity */}
        <SocialShareClient title={title} slug={slug} />
      </div>
    </div>
  );
}
