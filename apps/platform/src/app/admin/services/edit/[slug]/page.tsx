import { getAdminServiceBySlugServer } from "@/queries/adminServicesQueriesServer";
import { ServiceEditClient } from "@/components/admin/service-edit-client";
import { AdminProductService } from "@/queries/adminServicesQueries";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PermissionProtected } from "@/components/admin/permission-protected";
import { PERMISSION_SCOPES } from "@/lib/permissionService";

// Force dynamic rendering for admin pages
export const dynamic = "force-dynamic";

// Define the Service type
interface Service {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  cover_image: string | null;
  category_id: string | null;
  service_type: "product" | "service" | "course" | "consultation";
  base_price: number | null;
  currency: string;
  pricing_type: "one_time" | "recurring" | "custom";
  billing_period: "monthly" | "yearly" | "weekly" | "daily" | null;
  available: boolean;
  featured: boolean;
  premium: boolean;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  views_count: number;
  inquiries_count: number;
  bookings_count: number;
  author_user_id: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    sort_order: number;
    active: boolean;
  } | null;
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const service = await getAdminServiceBySlugServer(resolvedParams.slug);

    if (!service) {
      return {
        title: "Service Not Found | Admin",
        description: "The requested service could not be found",
      };
    }

    return {
      title: `Edit ${service.title} | Admin`,
      description: `Edit the service: ${service.title}`,
    };
  } catch (error) {
    console.error("Error generating metadata for service edit page:", error);
    return {
      title: "Edit Service | Admin",
      description: "Edit service",
    };
  }
}

export default async function AdminServiceEditPage({ params }: PageProps) {
  try {
    // Await params before using its properties
    const resolvedParams = await params;
    // Fetch the service by slug
    const service = await getAdminServiceBySlugServer(resolvedParams.slug);

    if (!service) {
      notFound();
    }

    // Ensure the service has all required fields
    const formattedService: AdminProductService = {
      id: service.id,
      slug: service.slug,
      title: service.title || "",
      excerpt: service.excerpt || "",
      description: service.description || "",
      cover_image: service.cover_image || undefined,
      category_id: service.category_id || undefined,
      service_type: service.service_type || "service",
      base_price: service.base_price || undefined,
      currency: service.currency || "USD",
      pricing_type: service.pricing_type || "one_time",
      billing_period: service.billing_period || undefined,
      available: service.available !== undefined ? service.available : true,
      featured: service.featured !== undefined ? service.featured : false,
      premium: service.premium !== undefined ? service.premium : false,
      meta_title: service.meta_title || undefined,
      meta_description: service.meta_description || undefined,
      keywords: service.keywords || undefined,
      views_count: service.views_count || 0,
      inquiries_count: service.inquiries_count || 0,
      bookings_count: service.bookings_count || 0,
      author_user_id: service.author_user_id || undefined,
      published: service.published !== undefined ? service.published : false,
      sort_order: service.sort_order || 0,
      created_at: service.created_at || new Date().toISOString(),
      updated_at: service.updated_at || new Date().toISOString(),
      published_at: service.published_at || new Date().toISOString(),
      category: service.category,
    };

    return (
      <PermissionProtected
        requiredPermission={PERMISSION_SCOPES.MANAGE_SERVICES}
        fallback={
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Permission Required</h2>
            <p className="mb-4">
              You need the MANAGE_SERVICES permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Please contact an administrator to request access.
            </p>
          </div>
        }
      >
        <ServiceEditClient service={formattedService} />
      </PermissionProtected>
    );
  } catch (error) {
    console.error("Error loading service for editing:", error);
    notFound();
  }
}
