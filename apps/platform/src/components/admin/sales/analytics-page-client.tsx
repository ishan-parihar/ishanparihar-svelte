"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  ArrowLeft,
} from "lucide-react";
import { RevenueChart } from "./revenue-chart";
import { ServicePerformanceTable } from "./service-performance-table";
import { SalesAnalyticsCards } from "./sales-analytics-cards";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

type PeriodType = "7d" | "30d" | "90d" | "1y";

export function AnalyticsPageClient() {
  const [period, setPeriod] = useState<PeriodType>("30d");
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Invalidate all sales-related queries
      await queryClient.invalidateQueries({
        queryKey: ["payments", "getSalesAnalytics"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["payments", "getServiceSalesPerformance"],
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export analytics data for period:", period);
  };

  const getPeriodLabel = (period: PeriodType) => {
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

  return (
    <div className="w-full space-y-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/sales">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sales Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Sales Analytics
            </h1>
            <p className="text-muted-foreground">
              Detailed insights and performance metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base font-medium text-foreground">
                  Time Period
                </CardTitle>
                <CardDescription className="text-sm">
                  Select the time range for analytics data
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {getPeriodLabel(period)}
              </Badge>
              <Select
                value={period}
                onValueChange={(value: PeriodType) => setPeriod(value)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Cards */}
      <SalesAnalyticsCards period={period} />

      {/* Revenue Chart */}
      <RevenueChart period={period} />

      {/* Service Performance Table */}
      <ServicePerformanceTable period={period} />

      {/* Additional Info */}
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>
              Analytics data is updated in real-time. Use the refresh button to
              get the latest metrics.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
