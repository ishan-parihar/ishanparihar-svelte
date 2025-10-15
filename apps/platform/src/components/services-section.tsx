"use client";

import { AnimatedServiceCard } from "@/components/animated-service-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductService } from "@/lib/supabase";

interface ServicesSectionProps {
  services: ProductService[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  showViewAllButton?: boolean;
  viewAllHref?: string;
  maxItems?: number;
}

export function ServicesSection({
  services,
  isLoading = false,
  error = null,
  title = "Our Services",
  subtitle = "Discover our range of spiritual guidance and personal development offerings",
  showViewAllButton = true,
  viewAllHref = "/offerings",
  maxItems,
}: ServicesSectionProps) {
  // Animation variants for the section
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Handle loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>

          {/* Loading cards */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Limit to 3 cols max for home page */}
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted rounded-none mb-3"></div>
                <div className="space-y-2 p-4">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-6 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-none p-6 max-w-md mx-auto">
              <p className="text-destructive text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Limit services if maxItems is specified
  const displayServices = maxItems ? services.slice(0, maxItems) : services;

  return (
    <motion.section
      className="py-16 bg-background"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
          variants={headerVariants}
        >
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {subtitle}
            </p>
          </div>

          {showViewAllButton && services.length > 0 && (
            <Link href={viewAllHref}>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                View All Services
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Services Grid or Empty State */}
        {displayServices.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Limit to 3 cols max for home page */}
            {displayServices.map((service, index) => {
              // Validate the service before rendering
              if (!service || !service.slug) {
                console.error("Invalid service:", service);
                return null;
              }

              try {
                return (
                  <AnimatedServiceCard
                    key={service.id || service.slug}
                    id={service.id}
                    title={service.title || "Untitled Service"}
                    excerpt={service.excerpt || ""}
                    coverImage={service.cover_image}
                    category={
                      service.category
                        ? {
                            name: service.category.name,
                            slug: service.category.slug,
                            color: service.category.color || undefined,
                          }
                        : undefined
                    }
                    serviceType={service.service_type}
                    basePrice={service.base_price || undefined}
                    currency={service.currency || "USD"}
                    pricingType={service.pricing_type}
                    billingPeriod={service.billing_period || undefined}
                    featured={service.featured}
                    premium={service.premium}
                    slug={service.slug}
                    index={index}
                    viewsCount={service.views_count || 0}
                    inquiriesCount={service.inquiries_count || 0}
                    bookingsCount={service.bookings_count || 0}
                  />
                );
              } catch (error) {
                console.error(
                  `Error rendering service card for ${service.slug}:`,
                  error,
                );
                return null;
              }
            })}
          </div>
        ) : (
          <motion.div className="text-center py-12" variants={headerVariants}>
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Services Available
              </h3>
              <p className="text-muted-foreground mb-6">
                We're working on bringing you amazing services. Check back soon!
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">Get Notified</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
