"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/trpc-client";

interface ServicePerformancePanelProps {
  period?: "7d" | "30d" | "90d" | "1y";
  limit?: number;
}

export function ServicePerformancePanel({
  period = "30d",
  limit = 10,
}: ServicePerformancePanelProps) {
  const {
    data: performanceData,
    isLoading,
    error,
  } = api.payments.getServiceSalesPerformance.useQuery({
    period,
    limit,
  });

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

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType?.toLowerCase()) {
      case "product":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "service":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "course":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "consultation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-40 mb-2 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              <Skeleton className="h-4 w-32 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
            </div>
            <Skeleton className="h-4 w-4 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                  <Skeleton className="h-3 w-20 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                  <Skeleton className="h-3 w-12 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load service performance: {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const services = performanceData?.services || [];
  const maxRevenue = Math.max(
    ...services.map((s: any) => s.total_revenue || 0),
  );

  if (services.length === 0) {
    return (
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Service Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {getPeriodLabel(period)}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No service performance data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Top Performing Services
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {getPeriodLabel(period)}
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {services.map((service: any, index: number) => {
            const revenuePercentage =
              maxRevenue > 0 ? (service.total_revenue / maxRevenue) * 100 : 0;

            return (
              <div
                key={service.service_id || index}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {index < 3 && (
                      <Star
                        className={`h-3 w-3 ${
                          index === 0
                            ? "text-yellow-500"
                            : index === 1
                              ? "text-gray-400"
                              : "text-orange-600"
                        }`}
                      />
                    )}
                    <h4 className="text-sm font-medium text-card-foreground truncate">
                      {service.service_title || "Unknown Service"}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {service.service_type && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${getServiceTypeColor(service.service_type)}`}
                      >
                        {service.service_type}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Progress value={revenuePercentage} className="h-2" />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        <span>
                          {formatNumber(service.total_orders || 0)} orders
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>
                          {formatCurrency(service.total_revenue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-card-foreground">
                    {formatCurrency(service.total_revenue || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(service.total_orders || 0)} orders
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
