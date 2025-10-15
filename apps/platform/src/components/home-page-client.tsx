"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Brain, Sparkles } from "lucide-react";
import PhoenixHero from "@/components/hero/PhoenixHero";
import AnimatedFooter from "@/components/ui/animated-footer-site";
import { ProgressTracker } from "@/components/ui/progress-tracker";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ServiceTestimonial } from "@/lib/supabase";
import { useAuthModalTrigger } from "@/hooks/useAuthModalTrigger";
import CardSwap, { Card } from "@/components/reactbits/CardSwap/CardSwap";
import { FrameworkCard } from "@/components/framework-card/FrameworkCard";

// Define props interface
interface HomePageClientProps {
  testimonials?: ServiceTestimonial[];
}

// Optimized lazy loading with intersection observer for better performance
const IntegratedPathsSectionClient = dynamic(
  () =>
    import("@/components/sections/IntegratedPathsSectionClient").then((mod) => ({
      default: mod.IntegratedPathsSectionClient,
    })),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Loading content...
          </p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for non-critical sections to reduce initial load
  },
);

const TestimonialsSection = dynamic(
  () =>
    import("@/components/testimonials-section").then((mod) => ({
      default: mod.TestimonialsSection,
    })),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Loading testimonials...
          </p>
        </div>
      </div>
    ),
    ssr: false,
  },
);

const CTASection = dynamic(
  () =>
    import("@/components/cta-section").then((mod) => ({
      default: mod.CTASection,
    })),
  {
    loading: () => (
      <div className="h-64 animate-pulse bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Loading content...
          </p>
        </div>
      </div>
    ),
    ssr: false,
  },
);

const FeaturedArticlesClient = dynamic(
  () =>
    import("@/components/featured-articles-server").then((mod) => ({
      default: mod.FeaturedArticlesServer,
    })),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Loading articles...
          </p>
        </div>
      </div>
    ),
    ssr: false, // Client-side rendering for React Query hooks
  },
);

export function HomePageClient({ testimonials }: HomePageClientProps) {
  // Use the auth modal trigger hook to handle authentication modal triggers
  useAuthModalTrigger();

  // Hero section data
  const heroData = {
    headline: "Transformational Intelligence Architecture",
    description: "Integrating Integral Theory, Spiral Dynamics, and the Law of One for Organizational & Personal Evolution",
    valuePropositionStack: [
      {
        benefit: "Achieve 360° Clarity",
        methodology: "Using the Integral Framework"
      },
      {
        benefit: "Lead Through Complexity",
        methodology: "With Spiral Dynamics"
      },
      {
        benefit: "Design Resilient Systems",
        methodology: "Applying Systems Thinking"
      },
      {
        benefit: "Build High-Trust Teams",
        methodology: "Through Relational Intelligence"
      }
    ],
    primaryCta: {
      text: "Schedule a Free Consultation",
      link: "/offerings",
    },
    secondaryCta: {
      text: "See How It Works",
      link: "/about",
    },
  };

  // Four Intelligences data for CardSwap
  const fourIntelligences = [
    {
      title: "Individual Intelligence",
      description: "Master your inner landscape through integral self-development, consciousness expansion, and personal transformation practices.",
      keyFrameworks: ["Integral Theory", "Spiral Dynamics", "Shadow Work", "Meditation"],
      backgroundImageUrl: "/assets/frameworks/individual-intelligence.svg"
    },
    {
      title: "Social Intelligence",
      description: "Navigate relationships and communities with wisdom, empathy, and authentic connection in all your interactions.",
      keyFrameworks: ["Nonviolent Communication", "Relational Intelligence", "Community Building", "Conflict Resolution"],
      backgroundImageUrl: "/assets/frameworks/social-intelligence.svg"
    },
    {
      title: "Systems Intelligence",
      description: "Design and optimize complex systems for resilience, sustainability, and conscious evolution at scale.",
      keyFrameworks: ["Systems Thinking", "Complexity Science", "Organizational Development", "Change Management"],
      backgroundImageUrl: "/assets/frameworks/systems-intelligence.svg"
    },
    {
      title: "Cultural Intelligence",
      description: "Bridge diverse worldviews and co-create regenerative cultures that honor both tradition and innovation.",
      keyFrameworks: ["Cultural Dynamics", "Worldview Integration", "Regenerative Culture", "Wisdom Traditions"],
      backgroundImageUrl: "/assets/frameworks/cultural-intelligence.svg"
    }
  ];

  return (
    <>
      {/* Scroll progress indicator */}
      <ScrollProgress />
      
      {/* Progress tracker for user journey */}
      <ProgressTracker totalSections={7} />
      
      <section className="w-full h-screen flex items-center justify-center" data-section-index="0">
        {/* Critical above-the-fold content - PhoenixHero now handles its own dynamic imports internally */}
        <PhoenixHero {...heroData} />
      </section>

      {/* The Four Intelligences Section - Dynamic Framework Showcase */}
      <section className="w-full min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90" data-section-index="1">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 min-h-screen lg:min-h-[80vh] items-center">

            {/* Left Column - Content */}
            <div className="lg:col-span-7 space-y-8 lg:space-y-12 order-2 lg:order-1 flex flex-col justify-center">
              {/* Section Title */}
              <div className="space-y-6 lg:space-y-8">
                <div className="space-y-4 lg:space-y-6">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground font-headings leading-tight tracking-tight">
                    The Four Intelligences
                  </h2>
                  <div className="w-24 lg:w-32 h-1 bg-gradient-to-r from-accent-consciousness to-accent-quantum rounded-full"></div>
                </div>
                <div className="max-w-3xl">
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">
                    Explore the comprehensive framework that integrates personal mastery,
                    relational wisdom, systems thinking, and cultural intelligence.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - CardSwap */}
            <div className="lg:col-span-5 relative flex items-center justify-center order-1 lg:order-2 min-h-[60vh] lg:min-h-full">
              <div className="relative w-full flex items-center justify-center">
                <CardSwap
                  width={440}
                  height={550}
                  cardDistance={75}
                  verticalDistance={55}
                  delay={6000}
                  pauseOnHover={true}
                  easing="elastic"
                >
                  {fourIntelligences.map((intelligence, index) => (
                    <Card key={index} customClass="shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.16),0_4px_16px_rgba(0,0,0,0.12)] border-white/10 backdrop-blur-sm transition-shadow duration-500 ease-out">
                       <FrameworkCard
                     name={intelligence.title}
                     description={intelligence.description}
                     keyFrameworks={intelligence.keyFrameworks}
                      backgroundImageUrl={intelligence.backgroundImageUrl}
                      />
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </div>

          </div>
          
          {/* Interaction hint */}
          <div className="pt-4 lg:pt-6 flex justify-center">
            <p className="text-sm text-muted-foreground/70 font-medium tracking-wide uppercase">
              Hover cards to pause • Click to explore frameworks
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-consciousness rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-quantum rounded-full blur-3xl"></div>
        </div>
      </section>
      
      {/* Featured Articles Section */}
      <section className="w-full h-screen flex items-center justify-center" data-section-index="3">
        <div className="w-full h-full flex items-center justify-center">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Loading articles...
                  </p>
                </div>
              </div>
            }
          >
            <FeaturedArticlesClient />
          </Suspense>
        </div>
      </section>

      {/* Non-critical sections load lazily */}
      <section className="w-full h-screen flex items-center justify-center" data-section-index="4">
        <div className="w-full h-full flex items-center justify-center">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Loading content...
                  </p>
                </div>
              </div>
            }
          >
            <IntegratedPathsSectionClient />
          </Suspense>
        </div>
      </section>

      <section className="w-full h-screen flex items-center justify-center" data-section-index="5">
        <div className="w-full h-full flex items-center justify-center">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Loading testimonials...
                  </p>
                </div>
              </div>
            }
          >
            <TestimonialsSection testimonials={testimonials} />
          </Suspense>
        </div>
      </section>

      <section className="w-full h-screen flex items-center justify-center" data-section-index="6">
        <div className="w-full h-full flex items-center justify-center">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent mx-auto"></div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Loading content...
                  </p>
                </div>
              </div>
            }
          >
            <CTASection />
          </Suspense>
        </div>
      </section>

      </>
  );
}
