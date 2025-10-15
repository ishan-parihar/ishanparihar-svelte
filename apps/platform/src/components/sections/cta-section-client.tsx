"use client";

import { Button } from "@/components/ui/button";
import { ShuffleHero } from "@/components/ui/shuffle-grid";
import { TestimonialBlock } from "@/components/ui/testimonial-block";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSection, InteractiveButton } from "@/components/motion";
import { motion, Variants } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { FocusEnhancer } from "@/components/ui/focus-enhancer";
import { AmbientLight } from "@/components/ui/ambient-light";
import { Shield } from "lucide-react";
import { trackCtaClick } from "@/lib/analytics";

interface CtaSectionClientProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  stats?: Array<{ label: string; value: string }>;
}

export function CtaSectionClient({
  title = "Ready to Transform Your Life?",
  description = "Take the first step towards a more conscious, purposeful life. Join our community of seekers and discover the tools, guidance, and support you need to unlock your full potential.",
  primaryButtonText = "Schedule a Consultation",
  primaryButtonLink = "/#contact",
  secondaryButtonText = "Explore Services",
  secondaryButtonLink = "/offerings",
  imageUrl = "https://ext.same-assets.com/3349622857/1359213608.jpeg",
  imageAlt = "Transformation Journey",
  stats = [
    { label: "Years Experience", value: "5+" },
    { label: "Countries Reached", value: "50+" },
    { label: "YouTube Subscribers", value: "10K+" },
    { label: "Instagram Followers", value: "25K+" },
  ],
}: CtaSectionClientProps) {
  return (
    <section className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient light effect */}
      <AmbientLight 
        color="rgba(125, 211, 252, 0.1)" 
        intensity={0.2} 
        size={500} 
        speed={0.4}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
            }}
            initial={{ 
              opacity: 0,
              scale: 0,
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
            }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ShuffleHero Component Integration with Testimonial Block */}
      <AnimatedSection className="w-full h-full mx-auto relative z-10 flex flex-col items-center justify-center">
        <FocusEnhancer intensity={2}>
          <ShuffleHero
            title={title}
            subtitle="Limited Consultation Slots Available This Month" // Updated subtitle for urgency
            description={description}
            buttonText={primaryButtonText}
            buttonLink={primaryButtonLink}
            onButtonClick={() => trackCtaClick(primaryButtonText, "Final CTA Section")}
            rightColumn={<TestimonialBlock />} // Replace shuffle grid with testimonial block
          />
        </FocusEnhancer>

        {/* Risk Reversal Guarantee */}
        <AnimatedSection delay={0.1} className="flex justify-center mt-6">
          <motion.div 
            className="flex items-start max-w-2xl mx-auto p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Shield className="flex-shrink-0 w-5 h-5 text-primary mt-0.5 mr-3" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Our Commitment To You:</span> If you don't find immense value in our initial consultation, it's on us. No cost, no risk.
            </p>
          </motion.div>
        </AnimatedSection>

        {/* Secondary CTA Button */}
        <AnimatedSection delay={0.2} className="flex justify-center mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href={secondaryButtonLink}>
              <InteractiveButton 
                className="rounded-none px-8 py-6 text-lg border-2 border-neutral-800 hover:bg-neutral-100 text-neutral-900 dark:border-white dark:hover:bg-white/10 dark:text-white transition-all duration-300 bg-transparent relative overflow-hidden"
                onClick={() => trackCtaClick(secondaryButtonText, "Final CTA Section")}
              >
                {secondaryButtonText}
                <motion.div
                  className="absolute inset-0 bg-white/20 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </InteractiveButton>
            </Link>
          </motion.div>
        </AnimatedSection>

        {/* Social proof stats */}
        {stats && stats.length > 0 && (
          <AnimatedSection
            delay={0.4}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-8"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <motion.div 
                  className="text-3xl font-bold text-neutral-900 dark:text-white mb-2"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        )}
      </AnimatedSection>
    </section>
  );
}
