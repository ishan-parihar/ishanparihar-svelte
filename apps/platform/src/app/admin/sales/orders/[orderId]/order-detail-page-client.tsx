"use client";

import { api } from "@/lib/trpc-client";
import { LoadingSpinner } from "@/components/ui/loading-animations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderSummaryCard } from "@/components/admin/sales/order-detail/order-summary-card";
import { ServiceDetailsCard } from "@/components/admin/sales/order-detail/service-details-card";
import { PaymentInfoPanel } from "@/components/admin/sales/order-detail/payment-info-panel";
import { CustomerInfoCard } from "@/components/admin/sales/order-detail/customer-info-card";
import { OrderActionsPanel } from "@/components/admin/sales/order-detail/order-actions-panel";

interface OrderDetailPageClientProps {
  orderId: string;
}

export default function OrderDetailPageClient({
  orderId,
}: OrderDetailPageClientProps) {
  const {
    data: order,
    isLoading,
    error,
  } = api.payments.getOrderDetails.useQuery({
    orderId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/sales/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Failed to load order details"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/sales/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/sales/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">
              {order.order_number || `Order ${order.id.slice(0, 8)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <OrderSummaryCard order={order} />
          <ServiceDetailsCard order={order} />
          <PaymentInfoPanel order={order} />
        </div>

        {/* Sidebar Column - 1/3 width */}
        <div className="space-y-6">
          <CustomerInfoCard order={order} />
          <OrderActionsPanel order={order} />
        </div>
      </div>
    </div>
  );
}
