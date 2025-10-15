import { useState } from "react";
import { toast } from "sonner";

/**
 * Options for configuring social sharing behavior
 */
interface ShareOptions {
  title: string;
  slug: string;
  text?: string; // Optional description for email/native share
}

/**
 * Return type for the useSocialShare hook
 */
interface ShareMethods {
  shareOnTwitter: (e: React.MouseEvent) => void;
  shareOnFacebook: (e: React.MouseEvent) => void;
  shareOnLinkedIn: (e: React.MouseEvent) => void;
  copyToClipboard: (e: React.MouseEvent) => Promise<void>;
  nativeShare: (e: React.MouseEvent) => Promise<void>; // Web Share API
  copied: boolean;
  fullUrl: string;
}

/**
 * Custom hook for social sharing functionality
 * Consolidates all social sharing logic from multiple components
 *
 * @param options - Configuration options for sharing
 * @returns Object containing share methods and state
 */
export function useSocialShare(options: ShareOptions): ShareMethods {
  const { title, slug, text } = options;
  const [copied, setCopied] = useState(false);

  // Construct the full URL from the slug
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : `/blog/${slug}`;

  // Encode the title and URL for sharing
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(fullUrl);

  /**
   * Share on Twitter using Twitter's intent URL
   */
  const shareOnTwitter = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      "_blank",
      "width=550,height=420",
    );
  };

  /**
   * Share on Facebook using Facebook's sharer
   */
  const shareOnFacebook = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      "_blank",
      "width=550,height=420",
    );
  };

  /**
   * Share on LinkedIn using LinkedIn's sharing endpoint
   */
  const shareOnLinkedIn = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      "_blank",
      "width=550,height=420",
    );
  };

  /**
   * Copy the URL to clipboard using the Clipboard API
   */
  const copyToClipboard = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link to clipboard");
    }
  };

  /**
   * Use Web Share API if available, fallback to clipboard
   */
  const nativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();

    const shareData = {
      title: title,
      text: text || title,
      url: fullUrl,
    };

    try {
      // Check if Web Share API is available and can share the data
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        // Don't show toast for successful native share as the OS handles feedback
      } else if (navigator.share) {
        // Fallback for browsers that support share but not canShare
        await navigator.share({
          title: title,
          url: fullUrl,
        });
        // Don't show toast for successful native share as the OS handles feedback
      } else {
        // Fallback to clipboard copy
        await copyToClipboard(e);
      }
    } catch (err) {
      // If native sharing fails, try clipboard as fallback
      console.error("Error sharing:", err);
      try {
        await copyToClipboard(e);
      } catch (clipboardErr) {
        console.error("Failed to copy to clipboard as fallback:", clipboardErr);
        toast.error("Failed to share post. Please try again.");
      }
    }
  };

  return {
    shareOnTwitter,
    shareOnFacebook,
    shareOnLinkedIn,
    copyToClipboard,
    nativeShare,
    copied,
    fullUrl,
  };
}
