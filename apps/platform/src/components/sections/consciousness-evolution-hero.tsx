"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";

// Removed Silk component dependency to eliminate three.js from bundle

// Command center components removed - using new Bento architecture

interface ConsciousnessStats {
  value: string;
  label: string;
}

interface ConsciousnessEvolutionHeroProps {
  title?: string;
  subtitle?: string;
  animatedWords?: string[];
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  topButtonText?: string;
  topButtonLink?: string;
  animationInterval?: number;
  stats?: ConsciousnessStats[];
}

// Background Layer Component - Fixed positioning at z-0
function BackgroundLayer() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Quantum Field Background - CSS-only replacement for Silk */}
      <div className="absolute inset-0 mix-blend-screen">
        <div
          className="w-full h-full opacity-40"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
              linear-gradient(45deg, rgba(0, 212, 255, 0.05) 0%, transparent 100%)
            `,
            animation: "quantumFlow 8s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Holographic Grid Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating Consciousness Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-quantum rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ConsciousnessEvolutionHero({
  title = "Consciousness Evolution Protocol",
  subtitle = "Access the quantum leap in human development that 99.7% haven't discovered",
  animatedWords = [
    "consciousness",
    "evolution",
    "transformation",
    "awakening",
    "transcendence",
  ],
  description = "Proprietary consciousness acceleration technology for the next stage of human evolution. Join the evolutionary pioneers accessing advanced protocols for consciousness expansion.",
  primaryButtonText = "Initialize Protocol",
  primaryButtonLink = "#",
  secondaryButtonText = "View Demonstration",
  secondaryButtonLink = "#",
  topButtonText = "Latest Consciousness Research",
  topButtonLink = "#",
  animationInterval = 2500,
  stats = [
    { value: "99.7%", label: "Undiscovered by humanity" },
    { value: "∞", label: "Consciousness potential" },
    { value: "2025", label: "Evolution acceleration year" },
  ],
}: ConsciousnessEvolutionHeroProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const words = useMemo(() => animatedWords, [animatedWords]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, animationInterval);
    return () => clearTimeout(timeoutId);
  }, [wordIndex, words, animationInterval]);

  return (
    <>
      {/* Background Layer - Fixed at z-0 */}
      <BackgroundLayer />

      {/* UI Grid Layer - Relative at z-10 */}
      <main className="relative z-10 grid grid-cols-12 grid-rows-6 gap-6 p-8 min-h-screen bg-cosmos/80">
        {/* Command center components removed - using new Bento architecture */}

        {/* Main Hero Text - Center */}
        <div className="col-span-12 md:col-span-6 md:col-start-4 row-span-2 row-start-3 flex flex-col justify-center items-center text-center">
          <div className="text-center space-y-8">
            {/* Top Button */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="border-accent-quantum/50 text-white hover:bg-accent-quantum/10 hover:border-accent-quantum gap-2"
                style={{
                  borderColor: "var(--accent-quantum)",
                  textShadow: "var(--glow-quantum)",
                }}
                asChild
              >
                <Link href={topButtonLink}>
                  <Sparkles className="w-4 h-4" />
                  {topButtonText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Main Title */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
                {title}
              </h1>

              {/* Animated Words */}
              <div className="relative h-16 flex items-center justify-center">
                <span className="text-2xl md:text-4xl font-semibold text-secondary">
                  Next-Level&nbsp;
                </span>
                <div className="relative inline-block min-w-[200px] md:min-w-[300px]">
                  {words.map((word, index) => (
                    <motion.span
                      key={index}
                      className="absolute left-0 text-2xl md:text-4xl font-semibold bg-gradient-to-r from-accent-consciousness to-accent-quantum bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 50, rotateX: -90 }}
                      animate={
                        wordIndex === index
                          ? { opacity: 1, y: 0, rotateX: 0 }
                          : { opacity: 0, y: -50, rotateX: 90 }
                      }
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </div>

              <motion.p
                className="text-lg md:text-xl text-secondary max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {subtitle}
              </motion.p>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-secondary max-w-prose text-center mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <button className="font-semibold text-primary px-8 py-3 rounded-md bg-gradient-to-r from-accent-consciousness to-accent-quantum hover:opacity-90 transition-opacity">
                <Link
                  href={primaryButtonLink}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {primaryButtonText}
                </Link>
              </button>

              <button className="font-semibold text-secondary px-8 py-3 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
                <Link
                  href={secondaryButtonLink}
                  className="flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {secondaryButtonText}
                </Link>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Stats Cards - Bottom Row */}
        {stats && stats.length > 0 && (
          <div className="col-span-12 md:col-span-6 md:col-start-4 row-span-1 row-start-5 flex justify-around items-center space-x-4">
            <motion.div
              className="flex justify-around items-center w-full"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-surface/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center group hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-accent-consciousness group-hover:text-accent-quantum transition-all duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-secondary mt-2">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </main>
    </>
  );
}
