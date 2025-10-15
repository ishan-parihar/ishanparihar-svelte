"use client";

import React, { useState } from "react";
import { Target, Zap, Heart, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { AmbientLight } from "@/components/ui/ambient-light";

const DualStatePathsSection = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const pathPillars = [
    {
      id: "self-actualization",
      icon: Target,
      title: "Self-Actualization",
      tagline: "Unlocking Ultimate Potential",
      description:
        "The journey toward realizing your highest potential and authentic self.",
      fullTitle: "Self-Actualization",
      fullDescription:
        "Self-Actualization is the process of realizing and expressing one's deepest talents, capacities, and potentialities. It involves transcending the ego's limitations to access higher states of consciousness and creative expression. This path focuses on aligning with your unique purpose and manifesting your highest potential in all areas of life.",
      keyElements: [
        "Authentic Self-Expression",
        "Creative Actualization",
        "Purpose Alignment",
        "Peak Performance States",
        "Transcendence of Limitations",
        "Unconditional Self-Acceptance"
      ],
      href: "/path/self-actualization",
      color: "blue",
    },
    {
      id: "self-esteem",
      icon: Zap,
      title: "Self-Esteem",
      tagline: "Achievement, Success and Performance Enhancement",
      description:
        "Building genuine self-worth through authentic achievement and mastery.",
      fullTitle: "Self-Esteem",
      fullDescription:
        "True Self-Esteem emerges from authentic accomplishment, skill mastery, and the consistent experience of your own effectiveness. This path focuses on developing genuine confidence through real achievements, enhanced performance capabilities, and the cultivation of personal power that doesn't depend on external validation.",
      keyElements: [
        "Skill Mastery",
        "Performance Enhancement",
        "Confidence Building",
        "Goal Achievement",
        "Personal Power",
        "Recognition of Worth"
      ],
      href: "/path/self-esteem",
      color: "purple",
    },
    {
      id: "healing-journey",
      icon: Heart,
      title: "Healing Journey",
      tagline: "Therapy, Self-Acceptance and Conscious Living",
      description:
        "Integrating past wounds to create a foundation for authentic living.",
      fullTitle: "Healing Journey",
      fullDescription:
        "The Healing Journey involves working with past traumas, emotional wounds, and limiting beliefs to create a solid foundation for authentic living. This path emphasizes self-acceptance, emotional regulation, and the integration of shadow aspects to achieve wholeness and inner peace.",
      keyElements: [
        "Trauma Integration",
        "Emotional Regulation",
        "Shadow Work",
        "Self-Acceptance",
        "Mindful Living",
        "Inner Child Healing"
      ],
      href: "/path/healing",
      color: "green",
    },
    {
      id: "integrative-relationships",
      icon: Users,
      title: "Integrative Relationships",
      tagline: "Forming Better Connections with Cultural and Partnership Stances",
      description:
        "Creating conscious relationships that support mutual growth and understanding.",
      fullTitle: "Integrative Relationships",
      fullDescription:
        "Integrative Relationships focus on developing conscious, authentic connections with others that support mutual growth and understanding. This path explores the dynamics of partnership, cultural awareness, and the ability to form relationships that reflect your highest values and deepest truths.",
      keyElements: [
        "Conscious Partnership",
        "Cultural Awareness",
        "Authentic Communication",
        "Mutual Growth",
        "Intersubjective Understanding",
        "Relational Mastery"
      ],
      href: "/path/relationships",
      color: "orange",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-background"></div>
      
      {/* Ambient light effect */}
      <AmbientLight 
        color="rgba(56, 189, 248, 0.1)" 
        intensity={0.15} 
        size={400} 
        speed={0.3}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-primary/10 opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
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
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Your Path to Wholeness
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            The journey of personal evolution follows a natural progression. These
            are the key areas we explore together to foster genuine transformation.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {pathPillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            const isHovered = hoveredCard === pillar.id;
            
            return (
              <motion.div
                key={index}
                className="h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  ease: "easeOut",
                  delay: index * 0.1
                }}
                whileHover={{ y: -10 }}
              >
                <Link 
                  href={pillar.href}
                  className="block h-full transition-all duration-300 hover:scale-[1.02]"
                  onMouseEnter={() => setHoveredCard(pillar.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card 
                    className="h-full min-h-[400px] flex flex-col transition-all duration-500 hover:shadow-2xl border-accent/30 group relative overflow-hidden"
                  >
                    <div className="flex flex-col h-full">
                      {/* Content Area */}
                      <div className="px-6 flex-grow flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Default State - With Icon */}
                          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out p-6 ${
                            isHovered ? 'opacity-0 translate-y-12' : 'opacity-100 translate-y-0'
                          }`}>
                            <div className="flex justify-center mb-6">
                              <div className="p-4 rounded-full bg-blue-500/10">
                                <IconComponent className="h-12 w-12 text-blue-500" />
                              </div>
                            </div>
                            <CardHeader className="p-0 text-center">
                              <CardTitle className="text-2xl mb-3 text-primary">
                                {pillar.title}
                              </CardTitle>
                              <p className="text-lg font-bold mb-4 text-blue-500">
                                {pillar.tagline}
                              </p>
                              <CardDescription className="text-base leading-relaxed">
                                {pillar.description}
                              </CardDescription>
                            </CardHeader>
                            <div className="mt-8 flex items-center justify-center font-bold">
                              <span className="text-blue-500">EXPLORE PATH</span>
                              <span className="ml-2">→</span>
                            </div>
                          </div>
                          
                          {/* Hovered State - Refined content layout */}
                          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out p-6 ${
                            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
                          }`}>
                            <div className="text-center mb-6">
                              <CardTitle className="text-2xl mb-3 font-bold text-blue-500">
                                {pillar.fullTitle}
                              </CardTitle>
                              <CardDescription className="text-sm leading-relaxed max-w-md mb-6">
                                {pillar.fullDescription}
                              </CardDescription>
                            </div>
                            
                            {/* Key Elements - Two columns for better space utilization */}
                            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                              {pillar.keyElements.slice(0, 6).map((element, idx) => (
                                <div key={idx} className="flex items-center leading-tight">
                                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                                  <span className="text-xs text-left">{element}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-base text-secondary leading-relaxed max-w-2xl mx-auto">
            Begin wherever you are. Every step is part of the journey toward wholeness.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DualStatePathsSection;