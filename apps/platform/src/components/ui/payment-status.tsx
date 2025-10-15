"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  getPaymentStatus,
  formatCurrency,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/payments";
import { OrderWithDetails, PaymentWithOrder } from "@/lib/supabase";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Mail,
  Calendar,
  CreditCard,
  Package,
  User,
} from "lucide-react";

interface PaymentStatusProps {
  orderId?: string;
  razorpayOrderId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (order: any) => void;
  className?: string;
}

export function PaymentStatus({
  orderId,
  razorpayOrderId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  onStatusChange,
  className,
}: PaymentStatusProps) {
  const [order, setOrder] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch payment status
  const fetchPaymentStatus = useCallback(async () => {
    if (!orderId && !razorpayOrderId) {
      setError("Order ID or RazorPay Order ID is required");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await getPaymentStatus(orderId || razorpayOrderId!);

      if (result.success && result.order) {
        setOrder(result.order);
        setPayments(result.payments || []);
        onStatusChange?.(result.order);
      } else {
        setError(result.error || "Failed to fetch payment status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [orderId, razorpayOrderId, onStatusChange]);

  // Initial load
  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !order) return;

    const interval = setInterval(() => {
      fetchPaymentStatus();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, order, fetchPaymentStatus]);

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchPaymentStatus();
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
      case "captured":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
      case "processing":
      case "created":
      case "attempted":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading payment status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No order found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order #{order.orderNumber}
          </CardTitle>
          <Button onClick={handleRefresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <Badge
                  className={
                    ORDER_STATUS_COLORS[
                      order.status as keyof typeof ORDER_STATUS_COLORS
                    ]
                  }
                >
                  {
                    ORDER_STATUS_LABELS[
                      order.status as keyof typeof ORDER_STATUS_LABELS
                    ]
                  }
                </Badge>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="text-lg font-semibold">
                {formatCurrency(order.amount, order.currency)}
              </span>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paid:</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div key={payment.id} className="space-y-3">
                  {index > 0 && <Separator />}

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Payment Status:
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <Badge
                        className={
                          PAYMENT_STATUS_COLORS[
                            payment.status as keyof typeof PAYMENT_STATUS_COLORS
                          ]
                        }
                      >
                        {
                          PAYMENT_STATUS_LABELS[
                            payment.status as keyof typeof PAYMENT_STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </div>
                  </div>

                  {payment.razorpay_payment_id && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {payment.razorpay_payment_id}
                      </code>
                    </div>
                  )}

                  {payment.method && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="capitalize">{payment.method}</span>
                    </div>
                  )}

                  {payment.captured_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Captured:</span>
                      <span>{formatDate(payment.captured_at)}</span>
                    </div>
                  )}

                  {payment.failure_reason && (
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-muted-foreground">
                        Failure Reason:
                      </span>
                      <span className="text-red-600 text-right max-w-xs">
                        {payment.failure_reason}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {order.status === "paid" && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Your payment has been successfully processed. Here's what
                happens next:
              </p>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Check your email for confirmation
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule your session
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download receipt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
