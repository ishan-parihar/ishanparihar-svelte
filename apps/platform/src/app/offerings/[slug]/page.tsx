export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { getServiceBySlug } from "@/queries/servicesQueries";
import { ServiceDetailClient } from "@/components/service-detail-client";
import { Metadata } from "next";
import { trackOfferingView } from "@/lib/analytics/server";

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the service page
export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = createServiceRoleClient();
    if (!supabase) {
      return {
        title: "Service Not Found | Ishan Parihar",
        description: "The requested service could not be found.",
      };
    }

    const service = await getServiceBySlug(supabase, slug);

    if (!service) {
      return {
        title: "Service Not Found | Ishan Parihar",
        description: "The requested service could not be found.",
      };
    }

    return {
      title: service.meta_title || `${service.title} | Ishan Parihar Services`,
      description: service.meta_description || service.excerpt,
      keywords:
        service.keywords ||
        [service.title, service.category?.name, service.service_type].filter(
          Boolean,
        ),
      openGraph: {
        title: service.title,
        description: service.excerpt,
        images: service.cover_image ? [service.cover_image] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: service.title,
        description: service.excerpt,
        images: service.cover_image ? [service.cover_image] : [],
      },
    };
  } catch (error) {
    console.error("[ServicePage] Error generating metadata:", error);
    return {
      title: "Service | Ishan Parihar",
      description: "Spiritual guidance and personal development services.",
    };
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;

  try {
    const supabase = createServiceRoleClient();

    if (!supabase) {
      console.error("[ServicePage] Failed to create Supabase client");
      notFound();
    }

    // Fetch the service data
    const service = await getServiceBySlug(supabase, slug);

    if (!service) {
      console.log(`[ServicePage] Service not found: ${slug}`);
      notFound();
    }

    console.log(`[ServicePage] Successfully loaded service: ${service.title}`);

    // Track offering view on the server side
    try {
      await trackOfferingView(service.slug, service.title);
    } catch (error) {
      console.error("[ServicePage] Error tracking offering view:", error);
    }

    return (
      <main className="min-h-screen bg-background">
        <ServiceDetailClient service={service} />
      </main>
    );
  } catch (error) {
    console.error("[ServicePage] Error loading service:", error);
    notFound();
  }
}

// Generate static params for build optimization (optional)
export async function generateStaticParams() {
  try {
    const supabase = createServiceRoleClient();

    if (!supabase) {
      console.warn(
        "[ServicePage] No Supabase client for static params generation",
      );
      return [];
    }

    // Fetch all published service slugs
    const { data: services, error } = await supabase
      .from("products_services")
      .select("slug")
      .eq("published", true)
      .eq("available", true);

    if (error) {
      console.error("[ServicePage] Error fetching service slugs:", error);
      return [];
    }

    return (services || []).map((service: any) => ({
      slug: service.slug,
    }));
  } catch (error) {
    console.error("[ServicePage] Error in generateStaticParams:", error);
    return [];
  }
}
