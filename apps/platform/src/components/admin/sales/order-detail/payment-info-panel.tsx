"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/payments";
import { format } from "date-fns";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface PaymentInfoPanelProps {
  order: any; // TODO: Type this properly based on the tRPC response
}

export function PaymentInfoPanel({ order }: PaymentInfoPanelProps) {
  const payments = order.payments || [];

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "succeeded":
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "refunded":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
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
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            No payment transactions found
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment: any, index: number) => (
              <div
                key={payment.id || index}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Payment Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPaymentStatusIcon(payment.status)}
                    <span className="font-medium">
                      Payment #{payment.id?.slice(0, 8) || index + 1}
                    </span>
                  </div>
                  <Badge className={getPaymentStatusColor(payment.status)}>
                    {payment.status?.charAt(0).toUpperCase() +
                      payment.status?.slice(1)}
                  </Badge>
                </div>

                {/* Payment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <div className="font-medium">
                      {formatCurrency(
                        payment.amount,
                        payment.currency || order.currency,
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Method:</span>
                    <div className="font-medium capitalize">
                      {payment.payment_method || "Unknown"}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">
                      Transaction Date:
                    </span>
                    <div className="font-medium">
                      {format(
                        new Date(payment.created_at),
                        "MMM dd, yyyy hh:mm a",
                      )}
                    </div>
                  </div>

                  {payment.payment_intent_id && (
                    <div>
                      <span className="text-muted-foreground">
                        Transaction ID:
                      </span>
                      <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {payment.payment_intent_id}
                      </div>
                    </div>
                  )}
                </div>

                {/* Razorpay Order ID */}
                {order.razorpay_order_id && (
                  <div className="border-t pt-3">
                    <span className="text-muted-foreground text-sm">
                      Razorpay Order ID:
                    </span>
                    <div className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">
                      {order.razorpay_order_id}
                    </div>
                  </div>
                )}

                {/* Refund Information */}
                {payment.refund_id && (
                  <div className="border-t pt-3">
                    <span className="text-muted-foreground text-sm">
                      Refund ID:
                    </span>
                    <div className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">
                      {payment.refund_id}
                    </div>
                  </div>
                )}

                {/* Payment Timestamps */}
                {payment.updated_at !== payment.created_at && (
                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    Last updated:{" "}
                    {format(
                      new Date(payment.updated_at),
                      "MMM dd, yyyy hh:mm a",
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Payment Summary */}
            <div className="border-t pt-4">
              <div className="bg-muted p-3 rounded space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Payments:</span>
                  <span className="font-medium">{payments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Amount Paid:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      payments
                        .filter(
                          (p: any) =>
                            p.status === "succeeded" || p.status === "paid",
                        )
                        .reduce(
                          (sum: number, p: any) => sum + (p.amount || 0),
                          0,
                        ),
                      order.currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Refunded:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      payments
                        .filter((p: any) => p.status === "refunded")
                        .reduce(
                          (sum: number, p: any) => sum + (p.amount || 0),
                          0,
                        ),
                      order.currency,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
