"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  ExternalLink,
  User,
  DollarSign,
  Calendar,
  Package,
  ShoppingCart,
  Mail,
} from "lucide-react";

interface CustomerSummary {
  customer_email: string;
  customer_name?: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  avg_order_value: number;
  preferred_service_type?: string;
  preferred_category?: string;
  unique_services_purchased: number;
}

interface CustomersTableProps {
  customers: CustomerSummary[];
  isLoading: boolean;
}

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {
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

  const getServiceTypeBadgeVariant = (serviceType?: string) => {
    switch (serviceType) {
      case "product":
        return "default";
      case "service":
        return "secondary";
      case "course":
        return "outline";
      case "consultation":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Orders
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Spent
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Order
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Preferences
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-border">
                <td className="p-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </td>
                <td className="p-3">
                  <Skeleton className="h-8 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No customers found
        </h3>
        <p className="text-muted-foreground">
          No customer purchase data available. Customers will appear here after
          making purchases.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Customer
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Orders
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Spent
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Last Order
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Preferences
            </th>
            <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.customer_email}
              className="hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
            >
              {/* Customer Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {customer.customer_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="font-mono">{customer.customer_email}</span>
                  </div>
                </div>
              </td>

              {/* Orders Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {customer.total_orders}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {customer.unique_services_purchased} unique services
                  </div>
                </div>
              </td>

              {/* Total Spent Column */}
              <td className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {formatCurrency(customer.total_spent)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(customer.avg_order_value)}
                  </div>
                </div>
              </td>

              {/* Last Order Column */}
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {formatDate(customer.last_order_date)}
                  </span>
                </div>
              </td>

              {/* Preferences Column */}
              <td className="p-3">
                <div className="space-y-1">
                  {customer.preferred_service_type && (
                    <Badge
                      variant={getServiceTypeBadgeVariant(
                        customer.preferred_service_type,
                      )}
                      className="text-xs"
                    >
                      {customer.preferred_service_type}
                    </Badge>
                  )}
                  {customer.preferred_category && (
                    <div className="text-xs text-muted-foreground">
                      {customer.preferred_category}
                    </div>
                  )}
                </div>
              </td>

              {/* Actions Column */}
              <td className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link
                    href={`/admin/sales/orders?customerEmail=${encodeURIComponent(customer.customer_email)}`}
                  >
                    <Eye className="h-4 w-4" />
                    View Orders
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
