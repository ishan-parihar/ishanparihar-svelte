"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "@/components/ui/payment-status";
import { trackCompletedSale } from "@/lib/analytics";
import {
  CheckCircle,
  ArrowLeft,
  Home,
  Calendar,
  Mail,
  Download,
} from "lucide-react";

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);

  // Get order details from URL parameters
  const orderId = searchParams.get("orderId");
  const razorpayOrderId = searchParams.get("razorpayOrderId");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    // If no order information is provided, redirect to home
    if (!orderId && !razorpayOrderId) {
      router.push("/");
      return;
    }
  }, [orderId, razorpayOrderId, router]);

  const handleOrderStatusChange = (order: any) => {
    setOrderData(order);
    
    // Track completed sale event when order is paid
    if (order && order.status === "paid" && order.service) {
      trackCompletedSale(
        order.service.id,
        order.service.title,
        order.total_amount,
        order.currency,
        order.id
      );
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoToServices = () => {
    router.push("/services");
  };

  const handleScheduleSession = () => {
    // TODO: Implement session scheduling
    console.log("Schedule session for order:", orderData);
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.log("Download receipt for order:", orderData);
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support
    window.location.href =
      "mailto:support@ishanparihar.com?subject=Payment Support";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your purchase. Your payment has been processed
              successfully.
            </p>

            {paymentId && (
              <div className="bg-white dark:bg-gray-800 rounded-none p-4 border">
                <p className="text-sm text-muted-foreground mb-1">Payment ID</p>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {paymentId}
                </code>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Payment Status Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PaymentStatus
                orderId={orderId || undefined}
                razorpayOrderId={razorpayOrderId || undefined}
                autoRefresh={true}
                refreshInterval={10000} // 10 seconds
                onStatusChange={handleOrderStatusChange}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Confirmation Email */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-none">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                          Check Your Email
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          A confirmation email with your booking details has
                          been sent to your email address.
                        </p>
                      </div>
                    </div>

                    {/* Schedule Session */}
                    <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-none">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                          Schedule Your Session
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Book a convenient time slot for your consultation or
                          service.
                        </p>
                      </div>
                    </div>

                    {/* Download Receipt */}
                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-none">
                      <Download className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">
                          Download Receipt
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Get your payment receipt for your records and tax
                          purposes.
                        </p>
                      </div>
                    </div>

                    {/* Contact Support */}
                    <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-none">
                      <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                          Need Help?
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Contact our support team if you have any questions or
                          concerns.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleScheduleSession} size="lg">
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule Session
                    </Button>
                    <Button
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Receipt
                    </Button>
                    <Button
                      onClick={handleContactSupport}
                      variant="outline"
                      size="lg"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center space-y-4"
            >
              <h3 className="text-xl font-semibold text-foreground">
                Continue Exploring
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
                <Button onClick={handleGoToServices} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse More Services
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
