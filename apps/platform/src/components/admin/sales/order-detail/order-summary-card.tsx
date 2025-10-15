"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/payments";
import { format } from "date-fns";
import { Calendar, CreditCard, Hash, Receipt } from "lucide-react";

interface OrderSummaryCardProps {
  order: any; // TODO: Type this properly based on the tRPC response
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "refunded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Order Number */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-4 w-4" />
              Order Number
            </div>
            <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {order.order_number || order.id?.slice(0, 8)}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge className={getStatusColor(order.status)}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            </Badge>
          </div>

          {/* Total Amount */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Total Amount
            </div>
            <div className="text-lg font-semibold">
              {formatCurrency(order.total_amount, order.currency)}
            </div>
          </div>

          {/* Order Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Order Date
            </div>
            <div className="text-sm">
              {format(new Date(order.created_at), "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(order.created_at), "hh:mm a")}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        {(order.discount_amount > 0 || order.tax_amount > 0) && (
          <div className="border-t pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>
                  {formatCurrency(
                    order.total_amount -
                      order.tax_amount +
                      order.discount_amount,
                    order.currency,
                  )}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>
                    -{formatCurrency(order.discount_amount, order.currency)}
                  </span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>
                    {formatCurrency(order.tax_amount, order.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total:</span>
                <span>
                  {formatCurrency(order.total_amount, order.currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-2">
              Order Notes
            </div>
            <div className="text-sm bg-muted p-3 rounded">{order.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
