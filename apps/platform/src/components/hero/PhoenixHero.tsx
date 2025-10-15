// src/components/hero/PhoenixHero.tsx
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Magnet from "@/components/reactbits/Magnet/Magnet";
import ClickSpark from "@/components/reactbits/ClickSpark/ClickSpark";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { trackCtaClick } from "@/lib/analytics";

// Define the props interface
interface PhoenixHeroProps {
  headline: string;
  description: string;
  valuePropositionStack: {
    benefit: string;
    methodology: string;
  }[];
  primaryCta: {
    text: string;
    link: string;
  };
  secondaryCta: {
    text: string;
    link: string;
  };
}

// Dynamic import for CurvedLoop component
const DynamicCurvedLoop = dynamic(
  () => import("@/components/reactbits/CurvedLoop/CurvedLoop"),
  {
    ssr: false,
    loading: () => <div className="h-32" />,
  }
);

// Dynamic import for Galaxy to isolate WebGL from main bundle
const DynamicGalaxy = dynamic(
  () =>
    import("@/components/reactbits/Galaxy/Galaxy").then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" />,
  },
);

// Dynamic import for LightRays to isolate WebGL from main bundle
const DynamicLightRays = dynamic(
  () =>
    import("@/components/reactbits/LightRays/LightRays").then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0" />,
  },
);

const PhoenixHero: React.FC<PhoenixHeroProps> = ({ headline, description, valuePropositionStack, primaryCta, secondaryCta }) => {
  const handleCurvedLoopEnter = () => {
    // Galaxy now handles mouse interaction internally without re-rendering
  };

  const handleCurvedLoopLeave = () => {
    // Galaxy now handles mouse interaction internally without re-rendering
  };
  
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center py-12 md:py-16">

      {/* Layer 1: Galaxy Background - Lowest z-index, behind everything */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <DynamicGalaxy
          transparent={true}
          mouseInteraction={true}
          glowIntensity={0.4}
          saturation={0.2}
          hueShift={200}
          density={1.2}
          starSpeed={0.3}
          rotationSpeed={0.05}
          twinkleIntensity={0.4}
        />
      </div>

      {/* Layer 2: Intense Light Rays Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <DynamicLightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={3.5}
          pulsating={true}
          fadeDistance={1.2}
          saturation={1.0}
          followMouse={true}
          mouseInfluence={0.3}
          noiseAmount={0.05}
          distortion={0.4}
        />
      </div>

      {/* Layer 3: Master Container with Perfect Centering - Integrated Layout */}
      <div className="relative z-30 w-full flex flex-col items-center justify-center px-0 pointer-events-none">
        {/* Enable pointer events only on interactive elements */}
        {/* Integrated Content Container - All Elements as Cohesive Unit */}
        <div className="flex flex-col items-center text-center w-full py-6 md:py-10">
          {/* Main Title - Powerful Mission Statement floating in galaxy */}
          <div className="relative w-full">
            {/* Primary powerful heading with word-by-word cascade animation */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-headings text-primary leading-tight tracking-tight mb-4 drop-shadow-2xl px-4 sm:px-6 lg:px-8"
            >
              <motion.span 
                className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {headline.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 20,
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut",
                        },
                      },
                    }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </motion.h1>

            {/* Secondary powerful line with word-by-word cascade animation */}
            <motion.h2
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-headings text-primary leading-tight tracking-tight drop-shadow-xl mt-5 px-4 sm:px-6 lg:px-8 -mb-12"
            >
              <motion.span
                className="text-gray-300 block max-w-sm sm:max-w-md md:max-w-lg mx-auto"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: headline.split(" ").length * 0.05 + 0.2,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {description.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 20,
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.4,
                          ease: "easeOut",
                        },
                      },
                    }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </motion.h2>

            {/* Value Proposition Stack - Interactive Wave System */}
            <div
              className="mt-0 mb-12 w-full"
              onMouseEnter={handleCurvedLoopEnter}
              onMouseLeave={handleCurvedLoopLeave}
            >
              <div className="pointer-events-auto">
                <DynamicCurvedLoop
                  valuePropositionStack={valuePropositionStack}
                  speed={2}
                  className="text-3xl"
                  curveAmount={200}
                  onMouseEnter={handleCurvedLoopEnter}
                  onMouseLeave={handleCurvedLoopLeave}
                />
              </div>
            </div>
          </div>

          {/* CTA Buttons - Enhanced Layout with Animation */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-2 mb-10 pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ClickSpark sparkColor="#00ffff" sparkCount={12} sparkRadius={25}>
                <Magnet magnetStrength={3} padding={50}>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-accent-consciousness to-accent-quantum hover:opacity-90 transition-opacity duration-300 px-8 py-4 text-lg font-medium min-w-[220px] tracking-wide text-primary shadow-lg"
                    onClick={() => trackCtaClick(primaryCta.text, "Hero Section")}
                  >
                    <Link href={primaryCta.link}>{primaryCta.text}</Link>
                  </Button>
                </Magnet>
              </ClickSpark>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ClickSpark sparkColor="#ffffff" sparkCount={10} sparkRadius={20}>
                <Magnet magnetStrength={3} padding={50}>
                  <Button
                    variant="outline"
                    asChild
                    className="border border-white/30 bg-transparent hover:bg-white/10 transition-all duration-300 px-8 py-4 text-lg font-medium min-w-[220px] tracking-wide text-gray-300"
                    onClick={() => trackCtaClick(secondaryCta.text, "Hero Section")}
                  >
                    <Link href={secondaryCta.link}>{secondaryCta.text}</Link>
                  </Button>
                </Magnet>
              </ClickSpark>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PhoenixHero;