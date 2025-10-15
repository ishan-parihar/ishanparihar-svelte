"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    if (!mounted) {
      setMounted(true);

      // Performance settings can be applied here in the future if needed

      // Add scroll detection for UI optimizations
      let scrollTimeout: NodeJS.Timeout;

      const handleScroll = () => {
        // Add class while scrolling
        document.body.classList.add("is-scrolling");

        // Clear previous timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Remove class after scrolling stops (with a delay)
        scrollTimeout = setTimeout(() => {
          document.body.classList.remove("is-scrolling");
        }, 100);
      };

      // Add listener with passive flag for better performance
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
      };
    }
  }, [mounted]);

  // While not mounted, return a simple loading indicator instead of null
  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
