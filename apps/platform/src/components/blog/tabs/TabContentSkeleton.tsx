"use client";

import React from "react";
import { BlogCardSkeleton } from "@/components/ui/loading-animations";

const TabContentSkeleton = () => {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default TabContentSkeleton;
