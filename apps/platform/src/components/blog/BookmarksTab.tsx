"use client";

import React, { useState } from "react";
import { Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { BookmarksModal } from "./BookmarksModal";

interface BookmarksTabProps {
  className?: string;
}

export function BookmarksTab({ className = "" }: BookmarksTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  // Only show bookmarks tab for authenticated users
  if (!session?.user) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={`
          whitespace-nowrap rounded-none font-medium transition-all duration-200
          text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 
          border border-transparent flex items-center gap-2
          ${className}
        `}
        aria-label="View bookmarks"
      >
        <Bookmark className="h-4 w-4" />
        <span className="hidden sm:inline">Bookmarks</span>
      </Button>

      <BookmarksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
