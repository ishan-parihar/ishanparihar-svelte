"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Calendar,
} from "lucide-react";

interface PurchaseSummary {
  customer_email: string;
  customer_name?: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  last_order_date?: string;
  unique_services_purchased: number;
  preferred_service_type?: string;
  preferred_category?: string;
}

interface PurchaseSummaryCardsProps {
  summary: PurchaseSummary;
}

export function PurchaseSummaryCards({ summary }: PurchaseSummaryCardsProps) {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const cards = [
    {
      title: "Total Spent",
      value: formatCurrency(summary.total_spent || 0),
      icon: DollarSign,
      description: "Lifetime value",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Total Orders",
      value: formatNumber(summary.total_orders || 0),
      icon: ShoppingCart,
      description: "Orders placed",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(summary.avg_order_value || 0),
      icon: TrendingUp,
      description: "Per order average",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Unique Services",
      value: formatNumber(summary.unique_services_purchased || 0),
      icon: Package,
      description: "Services purchased",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={index}
            className="relative transition-all duration-200 border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)]"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
                {card.title}
              </CardTitle>
              <div
                className={`p-2 rounded-none transition-all duration-200 ${card.bgColor}`}
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

      {/* Additional info card for last order date */}
      <Card className="relative transition-all duration-200 border-ui-border dark:border-[var(--border-primary)] rounded-none bg-surface-background dark:bg-[var(--bg-secondary)] shadow-none hover:bg-ui-border-light/30 dark:hover:bg-[var(--bg-hover)] sm:col-span-2 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-text-secondary dark:text-[var(--text-secondary)] uppercase tracking-wide font-ui">
            Customer Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Last Order
              </div>
              <div className="font-medium">
                {formatDate(summary.last_order_date)}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground mb-1">
                Preferred Service Type
              </div>
              <div className="font-medium">
                {summary.preferred_service_type || "No preference"}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground mb-1">
                Preferred Category
              </div>
              <div className="font-medium">
                {summary.preferred_category || "No preference"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
