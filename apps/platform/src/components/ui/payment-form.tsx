"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

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

interface PaymentFormProps {
  service: ServiceWithDetails;
  selectedPricingTier?: ServicePricing;
  onPricingTierChange?: (tier: ServicePricing) => void;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentFailure?: (error: any) => void;
  onPaymentStart?: () => void;
  onPaymentCancel?: () => void;
  className?: string;
}

export function PaymentForm({
  service,
  selectedPricingTier,
  onPricingTierChange,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentStart,
  onPaymentCancel,
  className,
}: PaymentFormProps) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    mode: "onChange",
  });

  // Watch form values for payment button
  const formValues = watch();

  // Handle pricing tier selection
  const handlePricingTierSelect = (tier: ServicePricing) => {
    onPricingTierChange?.(tier);
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentCompleted(true);
    onPaymentSuccess?.(paymentData);
  };

  // Handle payment failure
  const handlePaymentFailure = (error: any) => {
    onPaymentFailure?.(error);
  };

  // Get current amount
  const currentAmount = selectedPricingTier?.price || service.base_price || 0;
  const currentCurrency =
    selectedPricingTier?.currency || service.currency || "INR";

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Service Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment for {service.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Type:</span>
              <Badge variant="outline">
                {service.service_type.charAt(0).toUpperCase() +
                  service.service_type.slice(1)}
              </Badge>
            </div>
            {service.category && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{service.category.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(currentAmount, currentCurrency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers Selection */}
      {service.pricing && service.pricing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Pricing Option</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {service.pricing.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-4 border rounded-none cursor-pointer transition-all ${
                    selectedPricingTier?.id === tier.id
                      ? "border-accent bg-accent/5 ring-2 ring-accent"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => handlePricingTierSelect(tier)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">
                      {tier.tier_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(tier.price, tier.currency)}
                      </span>
                      {tier.popular && (
                        <Badge className="bg-black text-white dark:bg-white dark:text-black text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  {tier.tier_description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {tier.tier_description}
                    </p>
                  )}
                  {tier.features && tier.features.length > 0 && (
                    <ul className="space-y-1">
                      {tier.features.slice(0, 3).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {tier.features.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          +{tier.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Details Form */}
      {!paymentCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {/* Customer Name */}
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

              {/* Customer Email */}
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
                  placeholder="Enter your email address"
                  {...register("customerEmail")}
                  className={errors.customerEmail ? "border-red-500" : ""}
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>

              {/* Customer Phone */}
              <div className="space-y-2">
                <Label
                  htmlFor="customerPhone"
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
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

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes..."
                  rows={3}
                  {...register("notes")}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment Button */}
      {!paymentCompleted && (
        <Card>
          <CardContent className="pt-6">
            <PaymentButton
              service={service}
              selectedPricingTier={selectedPricingTier}
              customerEmail={formValues.customerEmail}
              customerName={formValues.customerName}
              customerPhone={formValues.customerPhone}
              className="w-full"
              size="lg"
              disabled={!isValid}
              onPaymentStart={onPaymentStart}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
              onPaymentCancel={onPaymentCancel}
            />
          </CardContent>
        </Card>
      )}

      {/* Payment Success Message */}
      {paymentCompleted && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Payment Successful!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Thank you for your payment. You will receive a confirmation
                  email shortly.
                </p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                <p>Service: {service.title}</p>
                <p>Amount: {formatCurrency(currentAmount, currentCurrency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
