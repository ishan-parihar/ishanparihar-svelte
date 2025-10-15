"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { api } from "@/lib/trpc-client";

interface SalesAnalyticsCardsProps {
  period?: "7d" | "30d" | "90d" | "1y";
}

export function SalesAnalyticsCards({
  period = "30d",
}: SalesAnalyticsCardsProps) {
  const {
    data: analyticsData,
    isLoading,
    error,
  } = api.payments.getSalesAnalytics.useQuery({
    period,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              <Skeleton className="h-4 w-4 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              <Skeleton className="h-3 w-24 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">
                Failed to load analytics
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summary = analyticsData?.summary;

  // Calculate unique customers from analytics data
  // For now, we'll estimate based on orders (this could be enhanced with actual customer count)
  const estimatedUniqueCustomers = Math.ceil((summary?.totalOrders || 0) * 0.7); // Rough estimate

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 90 days";
      case "1y":
        return "Last year";
      default:
        return "Last 30 days";
    }
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary?.totalRevenue || 0),
      icon: DollarSign,
      description: getPeriodLabel(period),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Total Orders",
      value: formatNumber(summary?.totalOrders || 0),
      icon: ShoppingCart,
      description: getPeriodLabel(period),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(summary?.avgOrderValue || 0),
      icon: TrendingUp,
      description: "Per order average",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Unique Customers",
      value: formatNumber(estimatedUniqueCustomers),
      icon: Users,
      description: "Estimated customers",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={index}
            className={`relative transition-all duration-200 border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)]`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
                {card.title}
              </CardTitle>
              <div
                className={`p-2 rounded-none transition-all duration-200 ${
                  index === 0
                    ? "bg-ui-border-light dark:bg-[var(--bg-tertiary)]"
                    : index === 1
                      ? "bg-blue-50 dark:bg-blue-950/30"
                      : index === 2
                        ? "bg-purple-50 dark:bg-purple-950/30"
                        : "bg-orange-50 dark:bg-orange-950/30"
                }`}
              >
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-text-primary dark:text-[var(--text-primary)] font-headings">
                  {card.value}
                </div>
                <p className="text-xs text-text-secondary dark:text-[var(--text-secondary)] font-ui">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
