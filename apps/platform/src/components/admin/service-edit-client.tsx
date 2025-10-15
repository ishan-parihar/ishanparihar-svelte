"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { ServiceForm } from "@/components/admin/service-form";

// Define the Service type for editing
interface EditService {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  cover_image?: string;
  category_id?: string;
  service_type: "product" | "service" | "course" | "consultation";
  base_price?: number;
  currency: string;
  pricing_type: "one_time" | "recurring" | "custom";
  billing_period?: "monthly" | "yearly" | "weekly" | "daily";
  available: boolean;
  featured: boolean;
  premium: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  published: boolean;
  sort_order: number;
}

interface ServiceEditClientProps {
  service: EditService;
}

export function ServiceEditClient({ service }: ServiceEditClientProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Prepare initial data for the form
  const initialData: EditService = {
    id: service.id,
    slug: service.slug,
    title: service.title,
    excerpt: service.excerpt,
    description: service.description,
    cover_image: service.cover_image || "",
    category_id: service.category_id || "",
    service_type: service.service_type,
    base_price: service.base_price || undefined,
    currency: service.currency,
    pricing_type: service.pricing_type,
    billing_period: service.billing_period || undefined,
    available: service.available,
    featured: service.featured,
    premium: service.premium,
    meta_title: service.meta_title || "",
    meta_description: service.meta_description || "",
    keywords: service.keywords || [],
    published: service.published,
    sort_order: service.sort_order,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force a page refresh to reload the service data
      window.location.reload();
    } catch (error) {
      console.error("[ServiceEditClient] Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/offerings/${service.slug}`} target="_blank">
              View Live
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/services">Back to Services</Link>
          </Button>
        </div>
      </div>

      {/* Service Form */}
      <ServiceForm initialData={initialData} />
    </>
  );
}
