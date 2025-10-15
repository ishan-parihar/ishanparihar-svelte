// src/app/admin/sales/orders/[orderId]/page.tsx
import React from "react";
import OrderDetailPageClient from "./order-detail-page-client";

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  // The page is now async, which correctly handles the params object.
  // The client component will handle its own data fetching and suspense boundaries.
  const { orderId } = await params;
  return <OrderDetailPageClient orderId={orderId} />;
}
