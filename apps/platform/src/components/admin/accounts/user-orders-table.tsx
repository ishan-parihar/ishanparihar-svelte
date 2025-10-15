"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Eye,
  Calendar,
  User,
  Package,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  order_number?: string;
  customer_name?: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  paid_at?: string;
  completed_at?: string;
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

interface UserOrdersTableProps {
  orders: Order[];
  title?: string;
}

export function UserOrdersTable({
  orders,
  title = "Order History",
}: UserOrdersTableProps) {
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
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-6 text-center">
        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No orders found for this user
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted">
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order
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
            {orders.map((order) => (
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.currency}
                    </p>
                  </div>
                </td>

                {/* Date Column */}
                <td className="p-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-card-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    {order.paid_at && (
                      <p className="text-xs text-muted-foreground">
                        Paid: {formatDate(order.paid_at)}
                      </p>
                    )}
                  </div>
                </td>

                {/* Actions Column */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/sales/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View order details</span>
                      </Button>
                    </Link>

                    {order.service?.slug && (
                      <Link
                        href={`/offerings/${order.service.slug}`}
                        target="_blank"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View service</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
