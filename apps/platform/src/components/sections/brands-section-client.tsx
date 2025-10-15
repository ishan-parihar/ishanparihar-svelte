"use client";

import { AnimatedCarousel } from "@/components/ui/logo-carousel";
import { AnimateOnScroll } from "@/components/utils/AnimateOnScroll";

interface Brand {
  name: string;
  slotId: string;
  description: string;
  category: string;
}

interface BrandsSectionClientProps {
  brands: Brand[];
}

export function BrandsSectionClient({ brands }: BrandsSectionClientProps) {
  // Convert brands to logo format for AnimatedCarousel
  const logoUrls = brands.map((brand) => getBrandLogoUrl(brand.name));

  // Use better logos from well-known tech companies for demo
  const partnerLogos = [
    "https://cdn.worldvectorlogo.com/logos/react-2.svg",
    "https://cdn.worldvectorlogo.com/logos/next-js.svg",
    "https://cdn.worldvectorlogo.com/logos/vercel.svg",
    "https://cdn.worldvectorlogo.com/logos/typescript.svg",
    "https://cdn.worldvectorlogo.com/logos/tailwindcss.svg",
    "https://cdn.worldvectorlogo.com/logos/stripe-4.svg",
    "https://cdn.worldvectorlogo.com/logos/notion-2.svg",
    "https://cdn.worldvectorlogo.com/logos/github-icon-1.svg",
    "https://cdn.worldvectorlogo.com/logos/figma-icon-one-color.svg",
    "https://cdn.worldvectorlogo.com/logos/framer-motion.svg",
    "https://cdn.worldvectorlogo.com/logos/storybook-1.svg",
    "https://cdn.worldvectorlogo.com/logos/sanity.svg",
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-black">
      <AnimateOnScroll threshold={0.1} triggerOnce={true}>
        <AnimatedCarousel
          title="Empowering the Cultures"
          animatedWords={["People", "Cultures", "Spaces"]}
          animationInterval={2500}
          logos={partnerLogos}
          autoPlay={true}
          autoPlayInterval={3000}
          itemsPerViewMobile={3}
          itemsPerViewDesktop={7}
          logoContainerWidth="w-24 md:w-32"
          logoContainerHeight="h-12 md:h-16"
          logoImageWidth="w-auto"
          logoImageHeight="h-6 md:h-8"
          padding="py-0"
          spacing="gap-8"
          containerClassName="w-full h-full flex flex-col items-center justify-center border-t border-b border-black/10 dark:border-white/10"
          titleClassName="text-center mx-auto max-w-6xl px-4"
          carouselClassName="mt-8"
        />
      </AnimateOnScroll>
    </div>
  );
}

// Helper function to get brand logo URLs (kept for backward compatibility)
function getBrandLogoUrl(brandName: string): string {
  const logoMap: Record<string, string> = {
    Forbes: "https://cdn.worldvectorlogo.com/logos/forbes.svg",
    Mindbodygreen:
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=100&fit=crop&crop=center",
    "Well+Good":
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=100&fit=crop&crop=center",
    Goop: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=100&fit=crop&crop=center",
    "Thrive Global":
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop&crop=center",
  };

  return (
    logoMap[brandName] ||
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=100&fit=crop&crop=center"
  );
}
