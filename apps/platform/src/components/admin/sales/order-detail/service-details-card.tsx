"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/payments";
import { ExternalLink, Package, Tag, DollarSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ServiceDetailsCardProps {
  order: any; // TODO: Type this properly based on the tRPC response
}

export function ServiceDetailsCard({ order }: ServiceDetailsCardProps) {
  const service = order.service;
  const pricingTier = order.pricing_tier;

  if (!service) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            No service information available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "product":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "service":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "course":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "consultation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Service Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          {/* Service Image */}
          {service.cover_image && (
            <div className="flex-shrink-0">
              <Image
                src={service.cover_image}
                alt={service.title}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            </div>
          )}

          {/* Service Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/admin/services/edit/${service.slug}`}
                  className="text-lg font-semibold hover:underline flex items-center gap-2"
                >
                  {service.title}
                  <ExternalLink className="h-4 w-4" />
                </Link>
                {service.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.excerpt}
                  </p>
                )}
              </div>
            </div>

            {/* Service Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={getServiceTypeColor(service.service_type)}>
                {service.service_type?.charAt(0).toUpperCase() +
                  service.service_type?.slice(1)}
              </Badge>

              {service.category && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {service.category.name}
                </Badge>
              )}

              {service.featured && <Badge variant="secondary">Featured</Badge>}

              {service.premium && <Badge variant="secondary">Premium</Badge>}
            </div>

            {/* Pricing Information */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-medium">
                  {service.base_price
                    ? formatCurrency(service.base_price, service.currency)
                    : "Custom"}
                </span>
              </div>

              {service.pricing_type && (
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium ml-1">
                    {service.pricing_type.replace("_", " ")}
                  </span>
                </div>
              )}

              {service.billing_period && (
                <div>
                  <span className="text-muted-foreground">Billing:</span>
                  <span className="font-medium ml-1">
                    {service.billing_period}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Tier Details */}
        {pricingTier && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Selected Pricing Tier</h4>
            <div className="bg-muted p-3 rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{pricingTier.tier_name}</span>
                <span className="font-semibold">
                  {formatCurrency(pricingTier.price, pricingTier.currency)}
                  {pricingTier.billing_period && (
                    <span className="text-sm text-muted-foreground">
                      /{pricingTier.billing_period}
                    </span>
                  )}
                </span>
              </div>

              {pricingTier.features && pricingTier.features.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Features:
                  </div>
                  <ul className="text-sm space-y-1">
                    {pricingTier.features.map(
                      (feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          {feature}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service Description */}
        {service.description && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Description</h4>
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
              {service.description.length > 300
                ? `${service.description.substring(0, 300)}...`
                : service.description}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-4 flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/services/edit/${service.slug}`}>
              Edit Service
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/offerings/${service.slug}`} target="_blank">
              View Public Page
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
