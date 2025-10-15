"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  ExternalLink,
  User,
  DollarSign,
  Calendar,
  Package,
  MoreHorizontal,
  Receipt,
  Edit,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Order {
  id: string;
  order_number?: string;
  customer_name?: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  service?: {
    id: string;
    title: string;
    slug: string;
    service_type: string;
    category?: {
      name: string;
    };
  };
  pricing_tier?: {
    name: string;
    price: number;
  };
}

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-none" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No orders found
        </h3>
        <p className="text-muted-foreground">
          No orders match your current filters. Try adjusting your search
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Order
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Customer
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Service/Product
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pricing Tier
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Amount
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
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
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
            >
              {/* Order Number Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <Link
                    href={`/admin/sales/orders/${order.id}`}
                    className="text-xs font-mono text-primary hover:underline bg-muted px-2 py-0.5 rounded"
                  >
                    {order.order_number || order.id?.slice(0, 8)}
                  </Link>
                </div>
              </td>

              {/* Customer Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {order.customer_name || "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.customer_email}
                  </p>
                </div>
              </td>

              {/* Service/Product Column */}
              <td className="p-3">
                <div className="space-y-1">
                  {order.service ? (
                    <>
                      <Link
                        href={`/admin/services/edit/${order.service.slug}`}
                        className="text-sm font-medium text-primary hover:underline truncate max-w-xs block"
                      >
                        {order.service.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {order.service.service_type}
                        </Badge>
                        {order.service.category && (
                          <Badge variant="secondary" className="text-xs">
                            {order.service.category.name}
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Service not found
                    </span>
                  )}
                </div>
              </td>

              {/* Pricing Tier Column */}
              <td className="p-3">
                {order.pricing_tier ? (
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-foreground">
                      {order.pricing_tier.name}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(order.pricing_tier.price, order.currency)}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Standard
                  </span>
                )}
              </td>

              {/* Amount Column */}
              <td className="p-3">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(order.total_amount || 0, order.currency)}
                  </span>
                </div>
              </td>

              {/* Status Column */}
              <td className="p-3">
                <Badge
                  className={getStatusColor(order.status)}
                  variant="secondary"
                >
                  {order.status}
                </Badge>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0" align="end">
                    <div className="flex flex-col text-sm">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                        Actions
                      </div>
                      <Link
                        href={`/admin/sales/orders/${order.id}`}
                        className="flex items-center px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </Link>
                      <Link
                        href={`/admin/sales/orders/${order.id}/receipt`}
                        className="flex items-center px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        <span>View Receipt</span>
                      </Link>
                      {order.service && (
                        <Link
                          href={`/admin/services/edit/${order.service.slug}`}
                          className="flex items-center px-3 py-2 hover:bg-muted transition-colors"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Service</span>
                        </Link>
                      )}
                      <div className="border-t border-border" />
                      <Link
                        href={`/admin/sales/orders/${order.id}`}
                        target="_blank"
                        className="flex items-center px-3 py-2 hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>Open in New Tab</span>
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
