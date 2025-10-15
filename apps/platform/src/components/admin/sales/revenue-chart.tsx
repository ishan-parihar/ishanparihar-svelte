"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";
import { api } from "@/lib/trpc-client";
import { format, parseISO } from "date-fns";

interface RevenueChartProps {
  period: "7d" | "30d" | "90d" | "1y";
}

type MetricType = "revenue" | "orders" | "aov";

export function RevenueChart({ period }: RevenueChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("revenue");
  const [chartType, setChartType] = useState<"line" | "area">("area");

  const {
    data: analyticsData,
    isLoading,
    error,
  } = api.payments.getSalesAnalytics.useQuery({
    period,
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

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (period === "7d") {
        return format(date, "MMM dd");
      } else if (period === "30d") {
        return format(date, "MMM dd");
      } else if (period === "90d") {
        return format(date, "MMM dd");
      } else {
        return format(date, "MMM yyyy");
      }
    } catch {
      return dateString;
    }
  };

  const chartData =
    analyticsData?.analytics?.map((item: any) => ({
      date: item.date,
      formattedDate: formatDate(item.date),
      revenue: item.revenue || 0,
      orders: item.order_count || 0,
      aov: item.avg_order_value || 0,
    })) || [];

  const getMetricConfig = (metric: MetricType) => {
    switch (metric) {
      case "revenue":
        return {
          key: "revenue",
          name: "Revenue",
          color: "#10b981",
          formatter: formatCurrency,
          icon: DollarSign,
        };
      case "orders":
        return {
          key: "orders",
          name: "Orders",
          color: "#3b82f6",
          formatter: formatNumber,
          icon: ShoppingCart,
        };
      case "aov":
        return {
          key: "aov",
          name: "Avg Order Value",
          color: "#8b5cf6",
          formatter: formatCurrency,
          icon: TrendingUp,
        };
    }
  };

  const metricConfig = getMetricConfig(selectedMetric);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {formatDate(label)}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Revenue:
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(data.revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                Orders:
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatNumber(data.orders)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                AOV:
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(data.aov)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card className="border-ui-border dark:border-[var(--border-primary)] bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none">
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Failed to load chart data
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </div>
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
              Revenue Analytics
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {period === "7d"
                ? "Last 7 days"
                : period === "30d"
                  ? "Last 30 days"
                  : period === "90d"
                    ? "Last 90 days"
                    : "Last year"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedMetric}
              onValueChange={(value: MetricType) => setSelectedMetric(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="aov">Avg Order Value</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={chartType}
              onValueChange={(value: "line" | "area") => setChartType(value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="line">Line</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              No data available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              No sales data found for the selected period
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="formattedDate"
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 12 }}
                    tickFormatter={metricConfig.formatter}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={metricConfig.key}
                    stroke={metricConfig.color}
                    fill={metricConfig.color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="formattedDate"
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-xs text-muted-foreground"
                    tick={{ fontSize: 12 }}
                    tickFormatter={metricConfig.formatter}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={metricConfig.key}
                    stroke={metricConfig.color}
                    strokeWidth={2}
                    dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: metricConfig.color,
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
