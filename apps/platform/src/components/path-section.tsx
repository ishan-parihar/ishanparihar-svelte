"use client";

import { Brain, Heart, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

const paths = [
  {
    title: "Self-Discovery",
    description:
      "Begin your journey by understanding your authentic self, uncovering your patterns, and identifying your unique purpose.",
    icon: Brain,
    color: "blue",
    link: "/offerings/self-discovery",
    features: [
      "Personal Assessment",
      "Pattern Recognition",
      "Purpose Alignment",
    ],
  },
  {
    title: "Healing & Integration",
    description:
      "Address emotional wounds, release limiting beliefs, and integrate shadow aspects to create a foundation for transformation.",
    icon: Heart,
    color: "purple",
    link: "/offerings/healing",
    features: ["Emotional Healing", "Shadow Work", "Belief Transformation"],
  },
  {
    title: "Conscious Living",
    description:
      "Develop practical tools for mindful living, authentic relationships, and aligning your daily actions with your deepest values.",
    icon: Target,
    color: "green",
    link: "/offerings/conscious-living",
    features: [
      "Mindful Practices",
      "Relationship Building",
      "Value Alignment",
    ],
  },
  {
    title: "Spiritual Expansion",
    description:
      "Explore expanded states of consciousness, connect with universal wisdom, and deepen your relationship with the spiritual dimension.",
    icon: Zap,
    color: "orange",
    link: "/offerings/spiritual-expansion",
    features: ["Meditation", "Energy Work", "Universal Connection"],
  },
];

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-500",
  purple: "bg-purple-500/10 text-purple-500",
  green: "bg-green-500/10 text-green-500",
  orange: "bg-orange-500/10 text-orange-500",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PathSection() {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      top: number;
      left: number;
      size: number;
    }>
  >([]);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 60 + 20,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/5"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}

      <div className="w-full h-full flex flex-col items-center justify-center max-w-5xl mx-auto relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-8"
          initial="hidden"
          whileInView="show"
          variants={container}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-primary mb-4"
            variants={item}
          >
            Your Path to Wholeness
          </motion.h2>
          <motion.p 
            className="text-secondary text-lg leading-relaxed"
            variants={item}
          >
            The journey of personal evolution follows a natural progression. These
            are the key areas we explore together to foster genuine transformation.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl"
          initial="hidden"
          whileInView="show"
          variants={container}
          viewport={{ once: true }}
        >
          {paths.map((path, index) => {
            const IconComponent = path.icon;
            return (
              <motion.div
                key={index}
                className="group relative bg-transparent shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200 dark:border-neutral-800 rounded-none p-5 flex gap-4 items-start h-full"
                variants={item}
                whileHover={{ y: -5 }}
              >
                <div className={`p-2 rounded-none ${colorClasses[path.color as keyof typeof colorClasses]}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-2 text-neutral-900 dark:text-white">
                    {path.title}
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-300 mb-3 text-sm flex-grow">
                    {path.description}
                  </p>
                  <ul className="space-y-1 mb-3">
                    {path.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-xs text-neutral-700 dark:text-neutral-300"
                      >
                        <svg
                          className="w-3 h-3 mr-1 text-primary"
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
                      size="sm"
                      className="group-hover:bg-accent-consciousness/10 group-hover:text-accent-consciousness transition-colors duration-200 rounded-none text-xs"
                    >
                      Explore {path.title} →
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial="hidden"
          whileInView="show"
          variants={container}
          viewport={{ once: true }}
        >
          <motion.p 
            className="text-base text-secondary leading-relaxed"
            variants={item}
          >
            Begin wherever you are. Every step is part of the journey.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}