"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ServiceWithDetails, ServicePricing } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PaymentModal } from "@/components/ui/payment-modal";
import { CoverImage } from "@/components/optimized/OptimizedImage";
import { normalizeImageUrl } from "@/lib/imageUtils";
import HorizontalTestimonialScroller from "@/components/ui/HorizontalTestimonialScroller";
import { trackInitiatedCheckout } from "@/lib/analytics";
import {
  Star,
  Users,
  Eye,
  MessageSquare,
  Sparkles,
  Crown,
  Check,
  X,
  Calendar,
  DollarSign,
  Quote,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Target,
} from "lucide-react";

interface ServiceDetailClientProps {
  service: ServiceWithDetails;
}

export function ServiceDetailClient({ service }: ServiceDetailClientProps) {
  const [selectedPricingTier, setSelectedPricingTier] = useState<
    ServicePricing | undefined
  >(service.pricing?.find((p) => p.popular) || service.pricing?.[0]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Debug log to ensure component is mounting
  console.log("ServiceDetailClient mounted", {
    showPaymentModal,
    paymentCompleted,
    isPaymentProcessing,
  });

  // Format price display
  const formatPrice = (
    price: number,
    currency: string,
    billingPeriod?: string,
  ) => {
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    if (billingPeriod && billingPeriod !== "one_time") {
      const periodMap = {
        monthly: "/month",
        yearly: "/year",
        weekly: "/week",
        daily: "/day",
      };
      return `${formattedPrice}${periodMap[billingPeriod as keyof typeof periodMap] || ""}`;
    }

    return formattedPrice;
  };

  // Get service type display info
  const getServiceTypeInfo = () => {
    const typeMap = {
      product: {
        label: "Product",
        color: "bg-accent/10 text-accent border-accent/20",
      },
      service: {
        label: "Service",
        color: "bg-primary/10 text-primary border-primary/20",
      },
      course: {
        label: "Course",
        color: "bg-accent/10 text-accent border-accent/20",
      },
      consultation: {
        label: "Consultation",
        color: "bg-muted/50 text-foreground border-border",
      },
    };
    return typeMap[service.service_type];
  };

  const serviceTypeInfo = getServiceTypeInfo();

  // Normalize image URL
  const imageSrc = normalizeImageUrl(service.cover_image, {
    context: "general",
    logFixes: false,
  });

  // Handle pricing tier selection
  const handlePricingTierChange = (tier: ServicePricing) => {
    setSelectedPricingTier(tier);
  };

  // Handle payment actions
  const handleBookNow = () => {
    console.log("Book Now button clicked");
    setShowPaymentModal(true);
    console.log("Payment modal should now be open");
  };

  const handlePaymentStart = () => {
    // Track initiated checkout event
    trackInitiatedCheckout(service.id, service.title);
    setIsPaymentProcessing(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentCompleted(true);
    setShowPaymentModal(false);
    setIsPaymentProcessing(false);
    console.log("Payment successful:", paymentData);
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    setIsPaymentProcessing(false);
    // Keep payment form open for retry
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setIsPaymentProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className={serviceTypeInfo.color}>
                  {serviceTypeInfo.label}
                </Badge>
                {service.category && (
                  <Badge
                    variant="outline"
                    className="border-border/50 text-muted-foreground hover:border-border hover:text-foreground transition-colors"
                  >
                    {service.category.name}
                  </Badge>
                )}
                {service.featured && (
                  <Badge variant="default">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {service.premium && (
                  <Badge variant="secondary">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Benefit-Driven Title */}
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Transform Your Life Through Conscious Evolution
              </h1>

              {/* Supporting Sub-headline */}
              <h2 className="text-2xl md:text-3xl font-display text-accent mb-6">
                {service.title}
              </h2>

              {/* Enhanced Excerpt with Promise */}
              <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
                {service.excerpt}
              </p>

              <p className="text-lg text-foreground font-medium mb-8">
                Join thousands who have discovered the clarity, tools, and
                community needed to navigate complexity, achieve holistic
                self-actualization, and consciously participate in cultural
                transformation.
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
                {service.views_count > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{service.views_count} views</span>
                  </div>
                )}
                {service.inquiries_count > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{service.inquiries_count} inquiries</span>
                  </div>
                )}
                {service.bookings_count > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{service.bookings_count} bookings</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-8">
                {service.base_price ? (
                  <div className="text-3xl font-bold text-foreground">
                    {formatPrice(
                      service.base_price,
                      service.currency,
                      service.billing_period || undefined,
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-semibold text-foreground">
                    Contact for pricing
                  </div>
                )}
                {service.pricing_type === "custom" && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Multiple pricing options available
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!paymentCompleted ? (
                  <>
                    <Button
                      size="lg"
                      className="flex-1 sm:flex-none"
                      onClick={() => {
                        console.log("Button clicked - direct handler");
                        handleBookNow();
                      }}
                      disabled={isPaymentProcessing}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {isPaymentProcessing
                        ? "Payment in Progress..."
                        : "Book & Pay Now"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 sm:flex-none"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Get Info
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/20">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-primary font-medium">
                      Payment Completed Successfully!
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] overflow-hidden shadow-2xl">
                <CoverImage
                  src={imageSrc}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem & Agitation Section */}
      <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Are You Struggling With These Challenges?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Feeling Stuck in Your Growth Journey
                </h3>
                <p className="text-muted-foreground">
                  You know there's more to life than what you're currently
                  experiencing, but you feel trapped in patterns that no longer
                  serve you. Despite reading books and trying different
                  approaches, you can't seem to break through to the next level
                  of consciousness and fulfillment.
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Overwhelmed by Conflicting Information
                </h3>
                <p className="text-muted-foreground">
                  There's so much spiritual and personal development content out
                  there, but it's fragmented and often contradictory. You're
                  tired of jumping from one method to another without a clear,
                  integrated path that actually works for your unique situation.
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Lacking Practical Application
                </h3>
                <p className="text-muted-foreground">
                  You understand the concepts intellectually, but struggle to
                  apply them in your daily life. The gap between spiritual
                  insights and practical transformation feels impossible to
                  bridge, leaving you frustrated and questioning your progress.
                </p>
              </div>

              <div className="p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Missing Community and Guidance
                </h3>
                <p className="text-muted-foreground">
                  You're on this journey alone, without proper mentorship or a
                  community of like-minded individuals. This isolation makes it
                  harder to stay motivated and you often doubt whether you're on
                  the right path.
                </p>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
              <p className="text-lg text-foreground font-medium">
                If any of these resonate with you, you're not alone. Thousands
                of conscious seekers face these exact challenges every day.
                <span className="text-accent font-semibold">
                  {" "}
                  But there is a way forward.
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Is This Right for You?
              </h2>
              <p className="text-lg text-muted-foreground">
                This transformative journey is designed for specific types of
                conscious seekers. See if you recognize yourself below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* This Is For You If Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Target className="h-5 w-5" />
                    This Is For You If...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You're ready to move beyond surface-level personal
                        development and dive deep into consciousness work
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You want a structured, integrated approach that combines
                        ancient wisdom with modern psychology
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You're committed to doing the inner work and applying
                        insights in your daily life
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You value community support and guidance from
                        experienced mentors on your journey
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* This Is NOT For You If Card */}
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    This Is NOT For You If...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You're looking for quick fixes or overnight
                        transformation without putting in the work
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You're not open to exploring spiritual concepts or
                        integrating them with practical application
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You prefer to work entirely alone without community
                        support or structured guidance
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        You're not ready to invest time and energy in your
                        personal and spiritual development
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Your transformation journey is simple and structured. Here's
                exactly what happens when you join.
              </p>
            </div>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start gap-6 p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="flex-shrink-0">
                  <Badge
                    variant="default"
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold"
                  >
                    1
                  </Badge>
                </div>
                <div className="flex items-start gap-4 flex-1">
                  <Calendar className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Enroll & Get Started
                    </h3>
                    <p className="text-muted-foreground">
                      Complete your enrollment and gain immediate access to our
                      comprehensive platform, welcome materials, and community
                      space.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-6 p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="flex-shrink-0">
                  <Badge
                    variant="default"
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold"
                  >
                    2
                  </Badge>
                </div>
                <div className="flex items-start gap-4 flex-1">
                  <Target className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Begin Your Personalized Journey
                    </h3>
                    <p className="text-muted-foreground">
                      Start with foundational modules tailored to your current
                      level, and begin implementing consciousness practices in
                      your daily life.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-6 p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="flex-shrink-0">
                  <Badge
                    variant="default"
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold"
                  >
                    3
                  </Badge>
                </div>
                <div className="flex items-start gap-4 flex-1">
                  <Users className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Connect & Grow with Community
                    </h3>
                    <p className="text-muted-foreground">
                      Join live sessions, participate in group discussions, and
                      receive ongoing support from both mentors and fellow
                      conscious seekers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-6 p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <div className="flex-shrink-0">
                  <Badge
                    variant="default"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  >
                    4
                  </Badge>
                </div>
                <div className="flex items-start gap-4 flex-1">
                  <Sparkles className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Experience Transformation
                    </h3>
                    <p className="text-muted-foreground">
                      Watch as insights integrate into lasting change,
                      relationships deepen, and you step into your role as a
                      conscious participant in cultural evolution.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="p-8 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Ready to Begin Your Journey?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands who have already started their conscious
                  evolution. Your transformation begins with a single step.
                </p>
                <Button size="lg" className="mr-4">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Start Your Journey Now
                </Button>
                <Button variant="outline" size="lg">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Ask Questions First
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  About This {serviceTypeInfo.label}
                </h2>
                <div className="max-w-none">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                    What's Included
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-start gap-3 p-6 bg-muted/30"
                      >
                        {feature.included ? (
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {feature.title}
                          </h3>
                          {feature.description && (
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Pricing Tiers */}
              {service.pricing && service.pricing.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pricing Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {service.pricing.map((tier) => (
                        <div
                          key={tier.id}
                          className={`p-6 border cursor-pointer transition-all ${
                            selectedPricingTier?.id === tier.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          } ${tier.popular ? "ring-2 ring-accent" : ""}`}
                          onClick={() => setSelectedPricingTier(tier)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">
                              {tier.tier_name}
                            </h3>
                            {tier.popular && (
                              <Badge variant="default" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-foreground mb-2">
                            {formatPrice(
                              tier.price,
                              tier.currency,
                              tier.billing_period || undefined,
                            )}
                          </div>
                          {tier.tier_description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {tier.tier_description}
                            </p>
                          )}
                          {tier.features && tier.features.length > 0 && (
                            <ul className="space-y-1">
                              {tier.features
                                .slice(0, 3)
                                .map((feature, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-muted-foreground"
                                  >
                                    <Check className="h-3 w-3 text-primary flex-shrink-0" />
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
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge
                        variant="outline"
                        className={serviceTypeInfo.color}
                      >
                        {serviceTypeInfo.label}
                      </Badge>
                    </div>
                    {service.category && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium text-foreground">
                          {service.category.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-medium text-foreground">
                        {service.views_count}
                      </span>
                    </div>
                    {service.bookings_count > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bookings</span>
                        <span className="font-medium text-foreground">
                          {service.bookings_count}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-display font-bold text-foreground mb-4">
                      Ready to Get Started?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Take the first step towards your transformation today.
                    </p>
                    <div className="space-y-3">
                      <Button size="lg" className="w-full">
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Now
                      </Button>
                      <Button variant="outline" size="lg" className="w-full">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Ask Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Objections Section */}
      <section className="py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                We've answered the most common questions to help you make an
                informed decision.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem
                value="item-1"
                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  How is this different from other spiritual or personal
                  development programs?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Our approach uniquely combines ancient wisdom traditions with
                  modern developmental psychology and practical application
                  frameworks. Unlike programs that focus on just one aspect, we
                  provide an integrated system that addresses consciousness,
                  practical skills, and real-world transformation
                  simultaneously.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What if I'm a complete beginner to consciousness work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Perfect! Our program is designed to meet you exactly where you
                  are. We start with foundational concepts and gradually build
                  complexity. Many of our most successful participants started
                  as complete beginners. You'll receive step-by-step guidance
                  and support throughout your journey.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  How much time do I need to commit each week?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  The program is designed to fit into your existing life. Most
                  participants spend 2-4 hours per week on core practices and
                  learning. However, the beauty of consciousness work is that it
                  integrates into everything you're already doing, so you'll
                  find opportunities for growth throughout your day.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What if I don't see results right away?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Consciousness development is a journey, not a destination.
                  While some participants experience immediate shifts, deeper
                  transformation typically unfolds over weeks and months. We
                  provide ongoing support and have a 30-day satisfaction
                  guarantee because we're confident in our approach and
                  committed to your success.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  Is this compatible with my existing spiritual or religious
                  beliefs?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  Absolutely. Our approach is non-denominational and designed to
                  enhance rather than replace your existing beliefs. We draw
                  from universal principles that transcend any single tradition,
                  helping you deepen your connection to whatever spiritual path
                  resonates with you.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-6"
                className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  What kind of support do I get during the program?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  You'll have access to our private community, regular group
                  calls, personalized guidance, and direct access to our support
                  team. We believe in providing comprehensive support because
                  transformation happens best in community with proper guidance.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-12 text-center">
              <div className="p-8 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Still Have Questions?
                </h3>
                <p className="text-muted-foreground mb-6">
                  We're here to help you make the best decision for your
                  journey. Reach out and we'll personally address any concerns
                  you might have.
                </p>
                <Button variant="outline" size="lg">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Us Directly
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      {service.testimonials && service.testimonials.length > 0 && (
        <HorizontalTestimonialScroller
          testimonials={service.testimonials}
          title={`What ${service.title} Clients Say`}
          subtitle={`Discover how clients have transformed their lives through ${service.title}.`}
          sectionTitle="Client Testimonials"
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        service={service}
        selectedPricingTier={selectedPricingTier}
        onPricingTierChange={handlePricingTierChange}
        onPaymentStart={handlePaymentStart}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    </div>
  );
}
