"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PaymentButton } from "@/components/ui/payment-button";
import { ServiceWithDetails, ServicePricing } from "@/lib/supabase";
import { formatCurrency } from "@/lib/payments";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Shield,
  Lock,
} from "lucide-react";
import { AnimatedSection, StaggeredList } from "@/components/motion";

// Form validation schema
const paymentFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceWithDetails;
  selectedPricingTier?: ServicePricing;
  onPricingTierChange?: (tier: ServicePricing) => void;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentFailure?: (error: any) => void;
  onPaymentStart?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  service,
  selectedPricingTier,
  onPricingTierChange,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentStart,
}: PaymentModalProps) {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    mode: "onChange",
  });

  // Watch form values for payment button
  const formValues = watch();

  // Handle modal close
  const handleClose = () => {
    if (!isProcessing) {
      reset();
      setPaymentCompleted(false);
      onClose();
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !paymentCompleted) {
      reset();
    }
  }, [isOpen, paymentCompleted, reset]);

  // Handle pricing tier selection
  const handlePricingTierSelect = (tier: ServicePricing) => {
    onPricingTierChange?.(tier);
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentCompleted(true);
    setIsProcessing(false);
    onPaymentSuccess?.(paymentData);

    // Auto-close modal after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  // Handle payment failure
  const handlePaymentFailure = (error: any) => {
    setIsProcessing(false);
    onPaymentFailure?.(error);
  };

  // Handle payment start
  const handlePaymentStart = () => {
    setIsProcessing(true);
    onPaymentStart?.();
  };

  // Get the current price to display
  const currentPrice = selectedPricingTier?.price || service.base_price || 0;
  const currency = selectedPricingTier?.currency || service.currency || "INR";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mainheading text-xl">
            {paymentCompleted ? "Payment Successful!" : "Complete Your Booking"}
          </DialogTitle>
          <DialogDescription className="font-ui">
            {paymentCompleted
              ? "Thank you for your purchase! A confirmation email with order details has been sent to your email address."
              : "Secure payment powered by RazorPay. Your information is safe and encrypted."}
          </DialogDescription>
        </DialogHeader>

        {paymentCompleted ? (
          // Success state
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Payment Completed Successfully!
            </h3>
            <p className="text-muted-foreground mb-4">
              Your booking for "{service.title}" has been confirmed.
            </p>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Order Total: {formatCurrency(currentPrice, currency)}
            </Badge>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Service Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-mainheading">
                  Service Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{service.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.excerpt || service.description}
                    </p>
                  </div>
                </div>

                {/* Pricing Tiers */}
                {service.pricing && service.pricing.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Select Pricing Option
                    </Label>
                    <div className="grid gap-2">
                      {service.pricing.map((tier) => (
                        <div
                          key={tier.id}
                          className={`p-3 border rounded-none cursor-pointer transition-colors ${
                            selectedPricingTier?.id === tier.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handlePricingTierSelect(tier)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {tier.tier_name}
                                </span>
                                {tier.popular && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              {tier.tier_description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {tier.tier_description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {formatCurrency(tier.price, tier.currency)}
                              </div>
                              {tier.billing_period &&
                                tier.billing_period !== "one_time" && (
                                  <div className="text-xs text-muted-foreground">
                                    per {tier.billing_period}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-lg">
                    {formatCurrency(currentPrice, currency)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-mainheading">
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customerName"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Enter your full name"
                      {...register("customerName")}
                      className={errors.customerName ? "border-red-500" : ""}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="customerEmail"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="Enter your email"
                      {...register("customerEmail")}
                      className={errors.customerEmail ? "border-red-500" : ""}
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-red-500">
                        {errors.customerEmail.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="customerPhone"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="Enter your phone number"
                    {...register("customerPhone")}
                    className={errors.customerPhone ? "border-red-500" : ""}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-500">
                      {errors.customerPhone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or questions..."
                    rows={3}
                    {...register("notes")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-none">
              <Shield className="h-4 w-4" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
              <Lock className="h-4 w-4" />
            </div>

            {/* Payment Button */}
            <PaymentButton
              service={service}
              selectedPricingTier={selectedPricingTier}
              customerEmail={formValues.customerEmail}
              customerName={formValues.customerName}
              customerPhone={formValues.customerPhone}
              className="w-full"
              size="lg"
              disabled={!isValid || isProcessing}
              onPaymentStart={handlePaymentStart}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
