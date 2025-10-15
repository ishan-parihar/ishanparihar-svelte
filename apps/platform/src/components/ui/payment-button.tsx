"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  formatCurrency,
  PAYMENT_STATUS_LABELS,
  initializeRazorPay,
  RAZORPAY_CONFIG,
} from "@/lib/payments";
import { ServiceWithDetails, ServicePricing } from "@/lib/supabase";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { api } from "@/lib/trpc-client";

interface PaymentButtonProps {
  service: ServiceWithDetails;
  selectedPricingTier?: ServicePricing;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentFailure?: (error: any) => void;
  onPaymentCancel?: () => void;
}

export function PaymentButton({
  service,
  selectedPricingTier,
  customerEmail,
  customerName,
  customerPhone,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCancel,
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const { toast } = useToast();

  // Currency context for dynamic conversion
  const {
    userLocation,
    paymentCurrency,
    convertToPaymentCurrency,
    formatDisplayPrice,
    formatPaymentPrice,
    getPaymentGatewayForUser,
    isDetecting,
  } = useCurrency();

  // tRPC mutations
  const createOrderMutation = api.payments.createOrder.useMutation();
  const verifyPaymentMutation = api.payments.verifyPayment.useMutation();

  // Calculate amount (always in USD from database)
  const baseAmountUSD = selectedPricingTier?.price || service.base_price || 0;

  // Validate required data
  const isValidForPayment = baseAmountUSD > 0 && customerEmail;

  // Reset payment state
  const resetPaymentState = () => {
    setIsProcessing(false);
    setPaymentStatus("idle");
    setLastError(null);
  };

  // Custom payment processing function that doesn't auto-verify
  const processPaymentWithoutVerification = async (
    orderDetails: any,
    razorpayKey: string,
    options: {
      onSuccess?: (response: any) => void;
      onFailure?: (error: any) => void;
      onDismiss?: () => void;
    } = {},
  ): Promise<void> => {
    try {
      console.log(
        "Starting payment process for order:",
        orderDetails.razorpayOrderId,
      );

      // Validate required parameters
      if (!orderDetails || !razorpayKey) {
        throw new Error("Missing required payment parameters");
      }

      if (!orderDetails.razorpayOrderId || !orderDetails.amount) {
        throw new Error("Invalid order details provided");
      }

      // Initialize RazorPay with timeout
      const initTimeout = new Promise<boolean>((_, reject) => {
        setTimeout(
          () => reject(new Error("RazorPay SDK loading timeout")),
          10000,
        );
      });

      const isLoaded = await Promise.race([initializeRazorPay(), initTimeout]);

      if (!isLoaded) {
        throw new Error("Failed to load RazorPay SDK");
      }

      // Verify Razorpay object is available
      if (typeof (window as any).Razorpay === "undefined") {
        throw new Error("RazorPay SDK not properly initialized");
      }

      console.log("RazorPay SDK ready, creating checkout options");

      // Configure RazorPay options with all payment methods enabled
      const razorpayOptions = {
        key: razorpayKey,
        amount: orderDetails.amount,
        currency: orderDetails.currency || "INR",
        order_id: orderDetails.razorpayOrderId,
        name: "Ishan Parihar Services",
        description: `Payment for ${orderDetails.serviceName || "Service"}`,
        image: "/favicon.ico",
        prefill: {
          email: orderDetails.customerEmail || "",
          name: orderDetails.customerName || "",
          contact: orderDetails.customerPhone || "",
        },
        theme: RAZORPAY_CONFIG.theme,
        config: {
          display: {
            blocks: {
              recommended: {
                name: "Recommended Payment Methods",
                instruments: [
                  {
                    method: "upi",
                  },
                  {
                    method: "card",
                  },
                  {
                    method: "netbanking",
                  },
                  {
                    method: "wallet",
                  },
                ],
              },
            },
            sequence: ["block.recommended"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed by user");
            options.onDismiss?.();
          },
          escape: true,
          backdropclose: false,
        },
        handler: (response: any) => {
          console.log("Payment response received:", response);
          options.onSuccess?.(response);
        },
      };

      console.log("Opening RazorPay checkout");

      // Create and open RazorPay checkout
      const razorpay = new (window as any).Razorpay(razorpayOptions);

      // Add error handler for checkout
      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        options.onFailure?.(
          new Error(response.error.description || "Payment failed"),
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Error processing payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown payment error";
      options.onFailure?.(new Error(errorMessage));
    }
  };

  // Retry payment
  const retryPayment = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      resetPaymentState();
      handlePayment();
    } else {
      toast({
        title: "Maximum Retries Reached",
        description:
          "Please refresh the page and try again, or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    console.log("PaymentButton: handlePayment called");
    console.log("PaymentButton: service data:", service);
    console.log("PaymentButton: selectedPricingTier:", selectedPricingTier);
    console.log("PaymentButton: customerEmail:", customerEmail);
    console.log("PaymentButton: isValidForPayment:", isValidForPayment);

    if (!isValidForPayment) {
      console.error("PaymentButton: Invalid payment data");
      toast({
        title: "Payment Error",
        description:
          "Please provide valid customer details and pricing information.",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple simultaneous payment attempts
    if (isProcessing) {
      console.log("Payment already in progress, ignoring click");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");
    onPaymentStart?.();

    // Set a timeout to reset processing state if payment gets stuck
    const paymentTimeout = setTimeout(() => {
      if (isProcessing) {
        console.warn("Payment timeout reached, resetting state");
        setIsProcessing(false);
        setPaymentStatus("failed");
        toast({
          title: "Payment Timeout",
          description: "Payment process timed out. Please try again.",
          variant: "destructive",
        });
      }
    }, 300000); // 5 minutes timeout

    try {
      console.log("Creating payment order...");

      // Create order using tRPC
      const orderResult = await createOrderMutation.mutateAsync({
        serviceId: service.id,
        pricingTierId: selectedPricingTier?.id,
        customerEmail: customerEmail!,
        customerName,
        customerPhone,
        notes: `Payment for ${service.title}`,
        paymentCurrency: paymentCurrency,
        userCountry: userLocation?.country,
        metadata: {
          service_type: service.service_type,
          pricing_tier: selectedPricingTier?.tier_name,
          payment_gateway: getPaymentGatewayForUser(),
          user_currency: paymentCurrency,
          base_amount_usd: baseAmountUSD,
        },
      });

      console.log("Order created successfully:", orderResult);

      // Transform the order data for processPayment function
      const orderForPayment = {
        razorpayOrderId: orderResult.razorpayOrder.id,
        amount: orderResult.razorpayOrder.amount,
        currency: orderResult.razorpayOrder.currency,
        serviceName: orderResult.service.title,
        customerEmail: customerEmail!,
        customerName,
        customerPhone,
      };

      // Process payment with RazorPay
      await processPaymentWithoutVerification(
        orderForPayment,
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        {
          onSuccess: async (response) => {
            clearTimeout(paymentTimeout);
            console.log("Payment completed successfully:", response);

            try {
              // Verify payment using tRPC
              const verificationResult =
                await verifyPaymentMutation.mutateAsync({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                });

              if (verificationResult.success) {
                console.log("Payment verification successful");
                setPaymentStatus("success");
                setIsProcessing(false);

                toast({
                  title: "Payment Successful!",
                  description: `Your payment for ${service.title} has been processed successfully.`,
                  variant: "default",
                });

                onPaymentSuccess?.(response);
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (verificationError) {
              console.error(
                "Error during payment verification:",
                verificationError,
              );
              setPaymentStatus("failed");
              setIsProcessing(false);

              toast({
                title: "Payment Verification Failed",
                description:
                  "Payment was processed but verification failed. Please contact support.",
                variant: "destructive",
              });

              onPaymentFailure?.(verificationError);
            }
          },
          onFailure: (error) => {
            clearTimeout(paymentTimeout);
            console.error("Payment failed:", error);
            setPaymentStatus("failed");
            setIsProcessing(false);

            const errorMessage =
              error?.message ||
              "There was an error processing your payment. Please try again.";
            setLastError(errorMessage);

            toast({
              title: "Payment Failed",
              description: errorMessage,
              variant: "destructive",
            });

            onPaymentFailure?.(error);
          },
          onDismiss: () => {
            clearTimeout(paymentTimeout);
            console.log("Payment modal dismissed by user");
            setIsProcessing(false);
            setPaymentStatus("idle");

            toast({
              title: "Payment Cancelled",
              description:
                "Payment was cancelled. You can try again when ready.",
              variant: "default",
            });

            onPaymentCancel?.();
          },
        },
      );
    } catch (error) {
      clearTimeout(paymentTimeout);
      console.error("Error initiating payment:", error);
      setPaymentStatus("failed");
      setIsProcessing(false);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate payment. Please try again.";
      setLastError(errorMessage);

      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });

      onPaymentFailure?.(error);
    }
  };

  // Get button content based on status
  const getButtonContent = () => {
    switch (paymentStatus) {
      case "processing":
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Payment Successful
          </>
        );
      case "failed":
        return (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            Payment Failed - Retry
          </>
        );
      default:
        return (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay {formatDisplayPrice(baseAmountUSD)}
          </>
        );
    }
  };

  // Get button variant based on status
  const getButtonVariant = () => {
    switch (paymentStatus) {
      case "success":
        return "default";
      case "failed":
        return "destructive";
      default:
        return variant;
    }
  };

  return (
    <div className="space-y-3">
      {/* Payment amount display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total Amount:</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {formatDisplayPrice(baseAmountUSD)}
          </span>
          {selectedPricingTier && (
            <Badge variant="outline" className="text-xs">
              {selectedPricingTier.tier_name}
            </Badge>
          )}
        </div>
      </div>

      {/* Validation warnings */}
      {!isValidForPayment && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-none">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            {!customerEmail && "Customer email is required. "}
            {baseAmountUSD <= 0 && "Valid pricing information is required."}
          </span>
        </div>
      )}

      {/* Payment button */}
      <Button
        onClick={paymentStatus === "failed" ? retryPayment : handlePayment}
        disabled={
          disabled ||
          isProcessing ||
          !isValidForPayment ||
          paymentStatus === "success"
        }
        variant={getButtonVariant()}
        size={size}
        className={className}
      >
        {getButtonContent()}
      </Button>

      {/* Error message and retry info */}
      {paymentStatus === "failed" && lastError && retryCount < 3 && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
          <p className="text-red-700 dark:text-red-300 mb-1">{lastError}</p>
          <p className="text-red-600 dark:text-red-400 text-xs">
            Retry attempt {retryCount + 1} of 3. Click the button above to try
            again.
          </p>
        </div>
      )}

      {/* Max retries reached */}
      {paymentStatus === "failed" && retryCount >= 3 && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
          <p className="text-red-700 dark:text-red-300 mb-1">
            Maximum retry attempts reached.
          </p>
          <p className="text-red-600 dark:text-red-400 text-xs">
            Please refresh the page and try again, or contact support if the
            issue persists.
          </p>
        </div>
      )}

      {/* Payment status indicator */}
      {paymentStatus !== "idle" && (
        <div className="text-center">
          <Badge
            variant={
              paymentStatus === "success"
                ? "default"
                : paymentStatus === "failed"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs"
          >
            {
              PAYMENT_STATUS_LABELS[
                paymentStatus === "success"
                  ? "captured"
                  : paymentStatus === "failed"
                    ? "failed"
                    : "attempted"
              ]
            }
          </Badge>
        </div>
      )}

      {/* Security notice */}
      <div className="text-xs text-muted-foreground text-center">
        <p>🔒 Secure payment powered by RazorPay</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
}
