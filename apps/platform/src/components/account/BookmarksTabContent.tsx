"use client";

import React, { useState } from "react";
import { api } from "@/lib/trpc-client";
import { MediumBlogCard } from "@/components/blog/MediumBlogCard";
import { transformBookmarksToCardData } from "@/lib/data-adapter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BookmarkIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function BookmarksTabContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const {
    data: bookmarksData,
    isLoading,
    error,
  } = api.user.getBookmarks.useQuery({
    page: currentPage,
    limit: limit,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Loading your bookmarks...
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-start space-x-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-none"
            >
              <Skeleton className="h-16 w-24 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert className="border-red-200 dark:border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load your bookmarks. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!bookmarksData || bookmarksData.bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookmarkIcon className="h-12 w-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
        <h3 className="text-lg font-subheading text-foreground mb-2">
          No Bookmarks Yet
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          Start bookmarking articles you want to read later. Your saved articles
          will appear here.
        </p>
      </div>
    );
  }

  // Transform bookmark data for MediumBlogCard
  const cardData = transformBookmarksToCardData(bookmarksData.bookmarks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-subheading text-foreground">
            My Bookmarks
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {bookmarksData.total} saved article
            {bookmarksData.total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="space-y-4">
        {cardData.map((bookmark, index) => (
          <MediumBlogCard key={bookmark.id} {...bookmark} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {bookmarksData.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from(
                { length: Math.min(5, bookmarksData.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (bookmarksData.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= bookmarksData.totalPages - 2) {
                    pageNum = bookmarksData.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={pageNum === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                },
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(bookmarksData.totalPages, prev + 1),
                    )
                  }
                  className={
                    currentPage === bookmarksData.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
