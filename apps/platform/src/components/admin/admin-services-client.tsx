"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeleteServiceMutation } from "@/queries/adminServicesQueries";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Loader2,
  RefreshCw,
  DollarSign,
  Eye,
  MessageSquare,
  Calendar,
} from "lucide-react";
import {
  AdminProductService,
  useAdminServicesWithHelpers,
} from "@/queries/adminServicesQueries";
import { Badge } from "@/components/ui/badge";

// Helper function to get the correct image URL
const getServiceImage = (service: AdminProductService): string => {
  let imageUrl = service.cover_image || "/default-service-image.jpg";

  // Validate and sanitize the URL
  try {
    // Handle null, undefined, or empty strings
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      return "/default-service-image.jpg";
    }

    // Trim whitespace
    imageUrl = imageUrl.trim();

    // Check if it's already a valid URL or relative path
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
      // Additional validation for absolute URLs
      if (imageUrl.startsWith("http")) {
        try {
          new URL(imageUrl); // This will throw if invalid
          return imageUrl;
        } catch (urlError) {
          console.error(
            `Invalid URL detected in admin services: "${imageUrl}"`,
            urlError,
          );
          return "/default-service-image.jpg";
        }
      }

      // Return relative paths as-is (they're valid for Next.js Image)
      return imageUrl;
    } else {
      // If it's not a valid URL or relative path, use default
      console.warn(
        `Invalid image URL format in admin services: "${imageUrl}". Using default.`,
      );
      return "/default-service-image.jpg";
    }
  } catch (error) {
    console.error(
      `Error processing image URL in admin services: "${imageUrl}"`,
      error,
    );
    return "/default-service-image.jpg";
  }
};

// Helper function to format price
const formatPrice = (service: AdminProductService): string => {
  if (!service.base_price) return "Free";

  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: service.currency || "USD",
  }).format(service.base_price);

  if (service.pricing_type === "recurring" && service.billing_period) {
    return `${price}/${service.billing_period}`;
  }

  return price;
};

// Helper function to get service type badge color
const getServiceTypeBadgeColor = (type: string) => {
  switch (type) {
    case "product":
      return "bg-blue-500/10 text-blue-500";
    case "service":
      return "bg-green-500/10 text-green-500";
    case "course":
      return "bg-purple-500/10 text-purple-500";
    case "consultation":
      return "bg-orange-500/10 text-orange-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

interface AdminServicesClientProps {
  initialServices: AdminProductService[];
}

export function AdminServicesClient({
  initialServices,
}: AdminServicesClientProps) {
  const [deleteError, setDeleteError] = useState("");

  // React Query for admin services using tRPC
  const {
    data: services = initialServices,
    isLoading,
    error,
    refetch,
  } = useAdminServicesWithHelpers({ includeUnpublished: true });

  // Ensure services is always an array (due to select transformation in the hook)
  const servicesArray = Array.isArray(services) ? services : [];

  // tRPC delete mutation
  const { mutateAsync: deleteService, isPending: isDeleting } =
    useDeleteServiceMutation();

  // Handle service deletion
  const handleDelete = async (slug: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this service? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleteError("");

    try {
      // Find the service to get its ID for deletion
      const serviceToDelete = servicesArray.find((s) => s.slug === slug);
      if (!serviceToDelete) {
        setDeleteError("Service not found");
        return;
      }

      // Use optimized mutation with automatic cache updates
      await deleteService({ id: serviceToDelete.id });

      // Cache updates are handled automatically by the mutation hook
    } catch (error) {
      console.error("Error deleting service:", error);
      setDeleteError("An error occurred while deleting the service.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Services & Products</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/services/new">Create New Service</Link>
          </Button>
        </div>
      </div>

      {(deleteError || error) && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {deleteError ||
            (error instanceof Error
              ? error.message
              : "Failed to load services")}
        </div>
      )}

      {(isDeleting || isLoading) && (
        <div className="mb-6 rounded-md bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isDeleting ? "Deleting service..." : "Loading services..."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {servicesArray.length > 0 ? (
          servicesArray.map((service) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Image Column */}
                  <div className="md:col-span-3 relative h-48 md:h-full min-h-[150px]">
                    <Image
                      src={getServiceImage(service)}
                      alt={service.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>

                  {/* Content Column */}
                  <div className="md:col-span-9 p-6">
                    <div className="flex flex-col h-full">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            className={`text-xs font-medium ${getServiceTypeBadgeColor(service.service_type)}`}
                          >
                            {service.service_type.charAt(0).toUpperCase() +
                              service.service_type.slice(1)}
                          </Badge>

                          {service.category && (
                            <Badge variant="outline" className="text-xs">
                              {service.category.name}
                            </Badge>
                          )}

                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(service.created_at)}
                          </span>

                          {service.featured && (
                            <Badge className="text-xs bg-amber-500/10 text-amber-500">
                              Featured
                            </Badge>
                          )}

                          {service.premium && (
                            <Badge className="text-xs bg-purple-500/10 text-purple-500">
                              Premium
                            </Badge>
                          )}

                          {!service.published && (
                            <Badge variant="secondary" className="text-xs">
                              Draft
                            </Badge>
                          )}

                          {!service.available && (
                            <Badge variant="destructive" className="text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>

                        <h2 className="text-xl font-bold mb-2">
                          {service.title}
                        </h2>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {service.excerpt}
                        </p>

                        {/* Service Stats */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatPrice(service)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{service.views_count} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{service.inquiries_count} inquiries</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mr-2"
                        >
                          <Link href={`/offerings/${service.slug}`}>
                            View Service
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mr-2"
                        >
                          <Link href={`/admin/services/edit/${service.slug}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(service.slug)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first service or product
            </p>
            <Button asChild>
              <Link href="/admin/services/new">Create New Service</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
