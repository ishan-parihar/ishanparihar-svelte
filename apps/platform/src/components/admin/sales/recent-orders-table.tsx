"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  Eye,
  Calendar,
  User,
  Package,
  DollarSign,
} from "lucide-react";
import { api } from "@/lib/trpc-client";
import Link from "next/link";

interface RecentOrdersTableProps {
  limit?: number;
}

export function RecentOrdersTable({ limit = 5 }: RecentOrdersTableProps) {
  const {
    data: ordersData,
    isLoading,
    error,
  } = api.payments.getAllOrdersAdmin.useQuery({
    page: 1,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Table Header Skeleton */}
        <div className="border border-border rounded-lg bg-card">
          <div className="bg-muted p-3 border-b border-border">
            <div className="grid grid-cols-5 gap-4">
              {["Order", "Customer", "Service", "Amount", "Date"].map(
                (_, i) => (
                  <Skeleton
                    key={i}
                    className="h-4 w-20 bg-ui-border dark:bg-[var(--bg-tertiary)]"
                  />
                ),
              )}
            </div>
          </div>
          {/* Table Rows Skeleton */}
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="p-3 border-b border-border last:border-b-0">
              <div className="grid grid-cols-5 gap-4 items-center">
                <Skeleton className="h-4 w-24 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                <Skeleton className="h-4 w-32 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                <Skeleton className="h-4 w-28 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                <Skeleton className="h-4 w-20 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
                <Skeleton className="h-4 w-24 bg-ui-border dark:bg-[var(--bg-tertiary)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-destructive/50 rounded-lg bg-destructive/10 p-6">
        <p className="text-sm text-destructive">
          Failed to load recent orders: {error.message}
        </p>
      </div>
    );
  }

  const orders = ordersData?.orders || [];

  if (orders.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-6 text-center">
        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg bg-card">
      <table className="w-full min-w-[600px]">
        <thead className="bg-muted">
          <tr className="border-b border-border">
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Order
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Customer
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Service
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Amount
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr
              key={order.id}
              className="hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
            >
              {/* Order Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {order.order_number || order.id?.slice(0, 8)}
                  </span>
                  <div>
                    <Badge
                      className={getStatusColor(order.status)}
                      variant="secondary"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </td>

              {/* Customer Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-card-foreground">
                      {order.customer_name || "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.customer_email}
                  </p>
                </div>
              </td>

              {/* Service Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-card-foreground truncate max-w-xs">
                    {order.service?.title || "Service not found"}
                  </h4>
                  {order.service?.service_type && (
                    <Badge variant="outline" className="text-xs">
                      {order.service.service_type}
                    </Badge>
                  )}
                </div>
              </td>

              {/* Amount Column */}
              <td className="p-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium text-card-foreground">
                    {formatCurrency(order.total_amount || 0)}
                  </span>
                </div>
              </td>

              {/* Date Column */}
              <td className="p-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(order.created_at)}
                  </span>
                </div>
              </td>

              {/* Actions Column */}
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/sales/orders/${order.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-3 w-3" />
                      <span className="sr-only">View order details</span>
                    </Button>
                  </Link>
                  <Link
                    href={`/admin/sales/orders/${order.id}`}
                    target="_blank"
                  >
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-3 w-3" />
                      <span className="sr-only">Open in new tab</span>
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
