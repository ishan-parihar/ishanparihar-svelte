import { Suspense } from "react";
import { PaymentSuccessClient } from "@/components/payment-success-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful | Ishan Parihar",
  description:
    "Your payment has been processed successfully. Thank you for your purchase.",
  robots: "noindex, nofollow", // Don't index payment pages
};

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        }
      >
        <PaymentSuccessClient />
      </Suspense>
    </main>
  );
}
