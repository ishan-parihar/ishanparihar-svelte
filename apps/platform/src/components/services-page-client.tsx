"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicServices } from "@/queries/servicesQueries";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { transformProductServicesToCardData } from "@/lib/data-adapter";
import NewTestimonialsSection from "@/components/ui/new-testimonials-section";
import { AnimatedSection, StaggeredList } from "@/components/motion";

// Dynamic import for MagicBento to prevent SSR issues
const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-none"></div>
      <div className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-none"></div>
      <div className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-none"></div>
    </div>
  ),
});

// Query keys for React Query caching
const servicesQueryKeys = {
  public: (limit?: number) => ["public-services", limit] as const,
};

// Placeholder data for static membership tiers
const membershipTiers = [
  {
    title: "Explorer",
    price: "Free",
    description:
      "Access our rich library of public blog posts and foundational articles.",
    features: [
      "Weekly Articles",
      "Public Newsletter",
      "Core Framework Concepts",
    ],
    cta: "Start Exploring",
    href: "/blog",
    variant: "outline" as const,
  },
  {
    title: "Integrator",
    price: "$10 / month",
    description:
      "Unlock premium content and join a community of dedicated practitioners.",
    features: [
      "All Explorer benefits, plus:",
      "Premium Deep-Dive Articles",
      "Members-Only Q&A Sessions",
      "Private Community Access",
    ],
    cta: "Become a Member",
    href: "#",
    variant: "default" as const,
    popular: true,
  },
  {
    title: "Visionary",
    price: "$40 / month",
    description:
      "Direct access and personalized guidance for maximum acceleration.",
    features: [
      "All Integrator benefits, plus:",
      "Monthly Group Coaching Calls",
      "Direct Q&A with Ishan",
      "Early Access to New Courses",
    ],
    cta: "Apply Now",
    href: "#",
    variant: "outline" as const,
  },
];

export function ServicesPageClient() {
  const supabase = createClient();
  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryKey: servicesQueryKeys.public(),
    queryFn: () => getPublicServices(supabase),
  });

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Section 1: Hero & Membership Tiers */}
      <AnimatedSection>
        <section className="text-center mb-24">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-4">
            Choose Your Pathway to Integration
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            From foundational knowledge to deep-dive community access, select the
            level of engagement that best suits your journey.
          </p>
        </section>
      </AnimatedSection>

      <section className="mb-24">
        <StaggeredList className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" staggerDelay={0.2}>
          {membershipTiers.map((tier) => (
            <Card
              key={tier.title}
              className={`flex flex-col h-full ${tier.popular ? "border-primary scale-105 shadow-lg" : ""}`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-display">
                    {tier.title}
                  </CardTitle>
                  {tier.popular && (
                    <Badge variant="default">Most Popular</Badge>
                  )}
                </div>
                <p className="text-3xl font-bold pt-2">{tier.price}</p>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant={tier.variant}>
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </StaggeredList>
      </section>

      {/* Section 2: Specific Offerings from Database */}
      <section className="mb-24">
        <AnimatedSection delay={0.3}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-primary mb-4">
              Specific Offerings & Courses
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Explore standalone courses, workshops, and one-on-one sessions
              available for purchase.
            </p>
          </div>
        </AnimatedSection>

        {isLoading && <p className="text-center">Loading offerings...</p>}
        {isError && (
          <p className="text-center text-red-500">Failed to load offerings.</p>
        )}

        {services && services.length > 0 && (
          <AnimatedSection delay={0.5}>
            <div className="w-full">
              <MagicBento
                cards={transformProductServicesToCardData(services)}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={true}
              />
            </div>
          </AnimatedSection>
        )}
      </section>

      {/* Section 3: Testimonials */}
      <AnimatedSection delay={0.7}>
        <NewTestimonialsSection />
      </AnimatedSection>
    </div>
  );
}
