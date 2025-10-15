"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/optimized/OptimizedImage";
import { normalizeImageUrl } from "@/lib/imageUtils";
import {
  Star,
  Clock,
  Users,
  Eye,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Crown,
} from "lucide-react";
import { LinkLoadingWrapper } from "@/components/loading/PageLoadingManager";

interface AnimatedServiceCardProps {
  id: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  category?: {
    name: string;
    slug: string;
    color?: string;
  };
  serviceType: "product" | "service" | "course" | "consultation";
  basePrice?: number;
  currency: string;
  pricingType: "one_time" | "recurring" | "custom";
  billingPeriod?: "monthly" | "yearly" | "weekly" | "daily";
  featured: boolean;
  premium: boolean;
  slug: string;
  index?: number;
  viewsCount?: number;
  inquiriesCount?: number;
  bookingsCount?: number;
}

export function AnimatedServiceCard({
  id,
  title,
  excerpt,
  coverImage,
  category,
  serviceType,
  basePrice,
  currency,
  pricingType,
  billingPeriod,
  featured,
  premium,
  slug,
  index = 0,
  viewsCount = 0,
  inquiriesCount = 0,
  bookingsCount = 0,
}: AnimatedServiceCardProps) {
  // Animation variants
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: index * 0.1 },
  };

  // Format price display
  const formatPrice = () => {
    if (!basePrice) return "Contact for pricing";

    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(basePrice);

    if (pricingType === "recurring" && billingPeriod) {
      const periodMap = {
        monthly: "/month",
        yearly: "/year",
        weekly: "/week",
        daily: "/day",
      };
      return `${formattedPrice}${periodMap[billingPeriod]}`;
    }

    return formattedPrice;
  };

  // Get service type display info
  const getServiceTypeInfo = () => {
    const typeMap = {
      product: {
        label: "Product",
        color: "bg-accent/10 text-accent border-accent/20",
      },
      service: {
        label: "Service",
        color:
          "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      },
      course: {
        label: "Course",
        color:
          "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      },
      consultation: {
        label: "Consultation",
        color:
          "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      },
    };
    return typeMap[serviceType];
  };

  const serviceTypeInfo = getServiceTypeInfo();

  // Normalize image URL
  const imageSrc = normalizeImageUrl(coverImage, {
    context: "general",
    logFixes: false,
  });

  return (
    <motion.div
      className="relative h-full AnimatedServiceCard"
      variants={fadeUp}
      initial="initial"
      animate="animate"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <LinkLoadingWrapper
        href={`/offerings/${slug}`}
        showIndicator={true}
        className="block"
      >
        <div className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border border-border rounded-none">
          {/* Cover Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <CoverImage
              src={imageSrc}
              alt={title}
              className="transition-transform duration-300 group-hover:scale-105"
              priority={index < 3}
            />

            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {featured && (
                <Badge className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {premium && (
                <Badge className="bg-purple-600 text-white dark:bg-purple-400 dark:text-black hover:bg-purple-700 dark:hover:bg-purple-500 border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Service type badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={serviceTypeInfo.color}>
                {serviceTypeInfo.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col">
            {/* Category */}
            {category && (
              <div className="mb-2">
                <Badge
                  variant="outline"
                  className="text-xs border-border/50 text-muted-foreground hover:border-border hover:text-foreground transition-colors"
                >
                  {category.name}
                </Badge>
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
              {title}
            </h3>

            {/* Excerpt */}
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {excerpt}
            </p>

            {/* Price */}
            <div className="mb-2">
              <div className="text-xl font-bold text-foreground">
                {formatPrice()}
              </div>
              {pricingType === "custom" && (
                <div className="text-sm text-muted-foreground">
                  Custom pricing available
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-4">
                {viewsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{viewsCount}</span>
                  </div>
                )}
                {inquiriesCount > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{inquiriesCount}</span>
                  </div>
                )}
                {bookingsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{bookingsCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              variant="outline"
              className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-300"
            >
              <span>
                {serviceType === "consultation"
                  ? "Book Consultation"
                  : serviceType === "course"
                    ? "Explore Course"
                    : serviceType === "product"
                      ? "View Product"
                      : "Explore Service"}
              </span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </LinkLoadingWrapper>
    </motion.div>
  );
}
