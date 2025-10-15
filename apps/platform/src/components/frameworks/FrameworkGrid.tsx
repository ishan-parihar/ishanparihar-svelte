"use client";

import React from "react";
import Link from "next/link";
import { FrameworkCard } from "@/components/framework-card/FrameworkCard";

// Define the type for a framework based on the data structure observed
interface Framework {
  slug: string;
  name: string;
}

interface FrameworkGridProps {
  frameworks: Framework[];
  categorySlug: string;
}

export const FrameworkGrid: React.FC<FrameworkGridProps> = ({ frameworks, categorySlug }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {frameworks.map((framework) => (
        <Link
          key={framework.slug}
          href={`/frameworks/${categorySlug}/${framework.slug}`}
          className="block"
        >
          <FrameworkCard
            name={framework.name}
            description={`Explore the ${framework.name} framework.`}
            keyFrameworks={[framework.name]}
            backgroundImageUrl={`/assets/frameworks/${categorySlug}.svg`}
          />
        </Link>
      ))}
    </div>
  );
};

export default FrameworkGrid;