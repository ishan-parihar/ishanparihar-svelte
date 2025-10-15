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
import { RefreshCw, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";
import { SalesAnalyticsCards } from "./sales-analytics-cards";
import { RecentOrdersTable } from "./recent-orders-table";
import { ServicePerformancePanel } from "./service-performance-panel";
import Link from "next/link";

export function SalesDashboardClient() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger a refresh of all queries by changing the period temporarily
    const currentPeriod = period;
    setPeriod("7d");
    setTimeout(() => {
      setPeriod(currentPeriod);
      setIsRefreshing(false);
    }, 100);
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

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headings font-bold text-text-primary dark:text-[var(--text-primary)]">
            Sales Dashboard
          </h1>
          <p className="text-text-secondary dark:text-[var(--text-secondary)] font-ui">
            Monitor sales performance, manage orders, and track revenue metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <Select
            value={period}
            onValueChange={(value: "7d" | "30d" | "90d" | "1y") =>
              setPeriod(value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <SalesAnalyticsCards period={period} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none h-full">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Latest customer orders and transactions
                  </CardDescription>
                </div>
                <Link href="/admin/sales/orders">
                  <Button variant="outline" size="sm" className="text-xs">
                    View All Orders
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <RecentOrdersTable limit={5} />
            </CardContent>
          </Card>
        </div>

        {/* Service Performance - Takes 1/3 of the width on large screens */}
        <div className="lg:col-span-1">
          <ServicePerformancePanel period={period} limit={5} />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">
              View detailed sales analytics and revenue trends
            </p>
            <Link href="/admin/sales/analytics">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Manage all customer orders and transactions
            </p>
            <Link href="/admin/sales/orders">
              <Button variant="outline" className="w-full">
                Manage Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800 rounded-none bg-card dark:bg-card shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Customer billing and support management
            </p>
            <Link href="/admin/sales/customers">
              <Button variant="outline" className="w-full">
                Manage Customers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
