/**
 * Payment Utilities
 *
 * This file contains utility functions for payment processing with RazorPay
 */

import { RazorPayOrderOptions, RazorPayPaymentResponse } from "./supabase";

// RazorPay configuration
export const RAZORPAY_CONFIG = {
  currency: "INR",
  theme: {
    color: "#0FA4AF", // Your brand color
  },
  modal: {
    ondismiss: () => {
      console.log("Payment modal dismissed");
    },
  },
};

// Payment status mappings
export const PAYMENT_STATUS_LABELS = {
  created: "Created",
  attempted: "Attempted",
  failed: "Failed",
  captured: "Successful",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
} as const;

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  completed: "Completed",
} as const;

// Payment status colors for UI
export const PAYMENT_STATUS_COLORS = {
  created: "bg-gray-100 text-gray-800",
  attempted: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  captured: "bg-green-100 text-green-800",
  refunded: "bg-blue-100 text-blue-800",
  partially_refunded: "bg-blue-100 text-blue-800",
} as const;

export const ORDER_STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-800",
  processing: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
} as const;

// Format currency amount
export function formatCurrency(
  amount: number,
  currency: string = "INR",
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Convert amount to smallest currency unit (paise for INR)
export function toSmallestCurrencyUnit(
  amount: number,
  currency: string = "INR",
): number {
  const multipliers: Record<string, number> = {
    INR: 100, // paise
    USD: 100, // cents
    EUR: 100, // cents
    GBP: 100, // pence
  };

  return Math.round(amount * (multipliers[currency] || 100));
}

// Convert from smallest currency unit to main unit
export function fromSmallestCurrencyUnit(
  amount: number,
  currency: string = "INR",
): number {
  const divisors: Record<string, number> = {
    INR: 100,
    USD: 100,
    EUR: 100,
    GBP: 100,
  };

  return amount / (divisors[currency] || 100);
}

// Initialize RazorPay checkout
export function initializeRazorPay(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if RazorPay is already loaded
    if (typeof (window as any).Razorpay !== "undefined") {
      console.log("RazorPay SDK already loaded");
      resolve(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existingScript) {
      console.log("RazorPay SDK script already exists, waiting for load...");
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    console.log("Loading RazorPay SDK...");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      console.log("RazorPay SDK loaded successfully");
      // Double check that Razorpay object is available
      if (typeof (window as any).Razorpay !== "undefined") {
        resolve(true);
      } else {
        console.error("RazorPay SDK loaded but Razorpay object not available");
        resolve(false);
      }
    };

    script.onerror = (error) => {
      console.error("Failed to load RazorPay SDK:", error);
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

// Create payment order
export async function createPaymentOrder(orderData: {
  serviceId: string;
  pricingTierId?: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  metadata?: Record<string, any>;
}): Promise<{
  success: boolean;
  order?: any;
  razorpayKey?: string;
  error?: string;
}> {
  try {
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create order");
    }

    return result;
  } catch (error) {
    console.error("Error creating payment order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Verify payment
export async function verifyPayment(
  paymentData: RazorPayPaymentResponse,
): Promise<{
  success: boolean;
  order?: any;
  payment?: any;
  error?: string;
}> {
  try {
    console.log("Verifying payment with data:", paymentData);

    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    console.log("Payment verification response:", result);

    if (!response.ok) {
      console.error("Payment verification failed:", result);
      throw new Error(result.error || "Failed to verify payment");
    }

    return result;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get payment status
export async function getPaymentStatus(orderId: string): Promise<{
  success: boolean;
  order?: any;
  payments?: any[];
  error?: string;
}> {
  try {
    const response = await fetch(`/api/payments/verify?orderId=${orderId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to get payment status");
    }

    return result;
  } catch (error) {
    console.error("Error getting payment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Process payment with RazorPay
export async function processPayment(
  orderDetails: any,
  razorpayKey: string,
  options: {
    onSuccess?: (response: RazorPayPaymentResponse) => void;
    onFailure?: (error: any) => void;
    onDismiss?: () => void;
  } = {},
): Promise<void> {
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
      handler: async (response: RazorPayPaymentResponse) => {
        try {
          console.log("Payment completed, verifying...", response);

          // Verify payment on server
          const verificationResult = await verifyPayment(response);

          if (verificationResult.success) {
            console.log("Payment verification successful");
            options.onSuccess?.(response);
          } else {
            console.error(
              "Payment verification failed:",
              verificationResult.error,
            );
            options.onFailure?.(
              new Error(
                verificationResult.error || "Payment verification failed",
              ),
            );
          }
        } catch (verificationError) {
          console.error(
            "Error during payment verification:",
            verificationError,
          );
          options.onFailure?.(verificationError);
        }
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
}

// Validate payment amount
export function validatePaymentAmount(
  amount: number,
  currency: string = "INR",
): boolean {
  const minAmounts: Record<string, number> = {
    INR: 1, // Minimum 1 INR
    USD: 0.5, // Minimum 50 cents
    EUR: 0.5, // Minimum 50 cents
    GBP: 0.3, // Minimum 30 pence
  };

  const minAmount = minAmounts[currency] || 1;
  return amount >= minAmount;
}

// Generate order receipt ID
export function generateReceiptId(prefix: string = "receipt"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

// Check if payment method is supported
export function isPaymentMethodSupported(method: string): boolean {
  const supportedMethods = [
    "card",
    "netbanking",
    "wallet",
    "upi",
    "emi",
    "cardless_emi",
    "paylater",
  ];

  return supportedMethods.includes(method.toLowerCase());
}

// Get payment method display name
export function getPaymentMethodDisplayName(method: string): string {
  const methodNames: Record<string, string> = {
    card: "Credit/Debit Card",
    netbanking: "Net Banking",
    wallet: "Digital Wallet",
    upi: "UPI",
    emi: "EMI",
    cardless_emi: "Cardless EMI",
    paylater: "Pay Later",
  };

  return methodNames[method.toLowerCase()] || method;
}
