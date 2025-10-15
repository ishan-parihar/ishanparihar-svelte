"use client";

import { Suspense } from "react";
import { ServicesSection } from "./services-section";
import { useFeaturedServices } from "@/queries/servicesQueries";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/lib/supabase";

interface ServicesServerProps {
  limit?: number;
  featured?: boolean;
  title?: string;
  subtitle?: string;
  showViewAllButton?: boolean;
  viewAllHref?: string;
}

// Loading component for the services section
function ServicesLoading({ title }: { title?: string }) {
  return <ServicesSection services={[]} isLoading={true} title={title} />;
}

// Error component for the services section
function ServicesError({ error, title }: { error: string; title?: string }) {
  return <ServicesSection services={[]} error={error} title={title} />;
}

// Client component that fetches services using React Query
function ServicesContent({
  limit = 3,
  featured = true,
  title,
  subtitle,
  showViewAllButton,
  viewAllHref,
}: ServicesServerProps) {
  const supabase = createClient();

  // Use React Query hook to fetch services
  const {
    data: services,
    isLoading,
    error,
  } = useFeaturedServices(supabase, limit);

  if (error) {
    console.error("[ServicesServer] Error fetching services:", error);
    return <ServicesError error="Failed to load services" title={title} />;
  }

  if (isLoading) {
    return <ServicesLoading title={title} />;
  }

  // Transform the data to ensure it matches our component interface
  const transformedServices: ProductService[] = (services || []).map(
    (service) => ({
      id: service.id,
      title: service.title,
      slug: service.slug,
      excerpt: service.excerpt,
      description: service.description,
      cover_image: service.cover_image,
      category_id: service.category_id,
      service_type: service.service_type,
      base_price: service.base_price,
      currency: service.currency,
      pricing_type: service.pricing_type,
      billing_period: service.billing_period,
      available: service.available,
      featured: service.featured,
      premium: service.premium,
      meta_title: service.meta_title,
      meta_description: service.meta_description,
      keywords: service.keywords,
      views_count: service.views_count || 0,
      inquiries_count: service.inquiries_count || 0,
      bookings_count: service.bookings_count || 0,
      author_user_id: service.author_user_id,
      published: service.published,
      sort_order: service.sort_order,
      created_at: service.created_at,
      updated_at: service.updated_at,
      published_at: service.published_at,
      // Include category data if available
      category: service.category || undefined,
    }),
  );

  return (
    <ServicesSection
      services={transformedServices}
      title={title}
      subtitle={subtitle}
      showViewAllButton={showViewAllButton}
      viewAllHref={viewAllHref}
      maxItems={limit}
    />
  );
}

// Main server component with Suspense boundary
export function ServicesServer({
  limit = 3,
  featured = true,
  title = "Featured Services",
  subtitle = "Discover our most popular spiritual guidance and personal development offerings",
  showViewAllButton = true,
  viewAllHref = "/offerings",
}: ServicesServerProps) {
  return (
    <Suspense fallback={<ServicesLoading title={title} />}>
      <ServicesContent
        limit={limit}
        featured={featured}
        title={title}
        subtitle={subtitle}
        showViewAllButton={showViewAllButton}
        viewAllHref={viewAllHref}
      />
    </Suspense>
  );
}
