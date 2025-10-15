"use client";

import { motion, Variants } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  slideInLeft,
  slideInRight,
  fadeIn,
} from "@/lib/animations";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PathSectionWrapperClientProps {
  children: React.ReactNode;
}

export function PathSectionWrapperClient({
  children,
}: PathSectionWrapperClientProps) {
  // Define particles state
  const [particles, setParticles] = useState<
    Array<{
      top: number;
      left: number;
      width: number;
      height: number;
    }>
  >([]);

  // Generate particles only on client side
  useEffect(() => {
    const newParticles = Array(5)
      .fill(null)
      .map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        width: Math.random() * 100 + 20,
        height: Math.random() * 100 + 20,
      }));
    setParticles(newParticles);
  }, []);

  return (
    <section
      id="path-section"
      className="h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background gradient removed for LIME/MAGENTA test */}
      <div className="absolute inset-0 bg-transparent"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-primary/10 opacity-20"
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              width: `${particle.width}px`,
              height: `${particle.height}px`,
            }}
            initial={{ opacity: 0.1, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.3, 1],
              y: [0, -30, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="w-full mx-auto px-4 md:px-6 relative z-10"
        variants={staggerContainer as Variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function AnimatedHeadingClient() {
  return (
    <motion.div
      className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
      variants={fadeUp as Variants}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
        Your Path to Wholeness
      </h2>
      <p className="text-secondary text-lg md:text-xl leading-relaxed">
        The journey of personal evolution follows a natural progression. These
        are the key areas we explore together to foster genuine transformation.
      </p>
    </motion.div>
  );
}

interface Path {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  features: string[];
}

export function AnimatedPathCardClient({
  path,
  index,
}: {
  path: Path;
  index: number;
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    green: "bg-green-500/10 text-green-500",
    orange: "bg-orange-500/10 text-orange-500",
  };

  return (
    <motion.div
      className="group relative bg-transparent shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 dark:border-neutral-800 rounded-none p-6 flex gap-4 items-start overflow-hidden"
      variants={(index % 2 === 0 ? slideInLeft : slideInRight) as Variants}
      whileHover={{ y: -5 }}
    >
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colorClasses[path.color as keyof typeof colorClasses]}`}
      />

      <motion.div
        className={`relative p-3 rounded-none ${colorClasses[path.color as keyof typeof colorClasses]}`}
        variants={fadeIn as Variants}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        {path.icon}
      </motion.div>

      <div className="relative flex-1">
        <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">
          {path.title}
        </h3>
        <p className="text-neutral-700 dark:text-neutral-300 mb-4">
          {path.description}
        </p>

        {/* Features list */}
        <ul className="space-y-2 mb-4">
          {path.features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center text-sm text-neutral-700 dark:text-neutral-300"
            >
              <svg
                className="w-4 h-4 mr-2 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <Link href={path.link}>
          <Button
            variant="outline"
            className="group-hover:bg-accent-consciousness/10 group-hover:text-accent-consciousness transition-colors duration-200"
          >
            Explore {path.title} →
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export function AnimatedFooterClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="mt-12 text-center"
      variants={fadeUp as Variants}
      custom={1}
    >
      {children}
    </motion.div>
  );
}

interface PathSectionClientProps {
  paths: Path[];
}

export function PathSectionClient({ paths }: PathSectionClientProps) {
  return (
    <PathSectionWrapperClient>
      <AnimatedHeadingClient />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {paths.map((path, index) => (
          <AnimatedPathCardClient key={index} path={path} index={index} />
        ))}
      </div>

      <AnimatedFooterClient>
        <p className="text-lg md:text-xl text-secondary font-medium mb-6 leading-relaxed">
          Begin wherever you are. Every step is part of the journey.
        </p>
        <Link href="/offerings">
          <Button className="bg-gradient-to-r from-accent-consciousness to-accent-quantum hover:opacity-90 transition-opacity duration-300 px-8 py-3 text-lg font-medium min-w-[200px] tracking-wide text-primary">
            Explore All Offerings
          </Button>
        </Link>
      </AnimatedFooterClient>
    </PathSectionWrapperClient>
  );
}
