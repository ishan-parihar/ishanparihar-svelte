import React, { useState } from "react";
import { LucideIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AnimatedSection, StaggeredList } from "@/components/motion";
import Link from "next/link";

// Define the props interface
interface FrameworkPillar {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  benefits: string[];
  hoverText: string;
  href: string;
}

interface FrameworkIntroProps {
  frameworkPillars: FrameworkPillar[];
}

const FrameworkIntro: React.FC<FrameworkIntroProps> = ({ frameworkPillars }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6">
            The Framework
          </h2>
          <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
            A comprehensive approach to conscious evolution that bridges ancient
            wisdom with modern understanding
          </p>
        </AnimatedSection>

        {/* Two-Column Grid with Interactive Cards */}
        <StaggeredList
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
          staggerDelay={0.15}
        >
          {frameworkPillars.map((pillar, index) => {
            const IconComponent = pillar.icon;
            const isHovered = hoveredCard === pillar.id;
            
            return (
              <Link 
                key={index} 
                href={pillar.href}
                className="block transition-all duration-300 hover:scale-[1.02]"
                onMouseEnter={() => setHoveredCard(pillar.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card 
                  className="h-auto min-h-[400px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:border-accent/50 group relative overflow-hidden"
                >
                  <div className="flex flex-col h-full">
                    {/* Content Area */}
                    <div className="px-8 flex-grow flex flex-col">
                      <div className="flex-grow flex items-start justify-center pt-10">
                        {/* Default State - With Icon */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out p-8 ${
                          isHovered ? 'opacity-0' : 'opacity-100'
                        }`}>
                          <div className="flex justify-center mb-6">
                            <div className="p-5 rounded-full bg-accent/10">
                              <IconComponent className="h-14 w-14 text-accent" />
                            </div>
                          </div>
                          <CardHeader className="p-0 text-center">
                            <CardTitle className="text-3xl mb-4 text-primary">
                              {pillar.title}
                            </CardTitle>
                            <p className="text-xl text-accent font-bold mb-6">
                              {pillar.tagline}
                            </p>
                            {/* Benefits List */}
                            <div className="mb-8">
                              {pillar.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center justify-center mb-2">
                                  <span className="text-accent mr-2">•</span>
                                  <span className={`text-base ${idx === 0 ? 'font-bold text-primary' : 'text-foreground'}`}>{benefit}</span>
                                </div>
                              ))}
                            </div>
                            {/* Learn More CTA - appears on hover */}
                            <div className="mt-4 flex items-center justify-center text-accent font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span>Learn More</span>
                              <span className="ml-3">→</span>
                            </div>
                          </CardHeader>
                          <div className="mt-4 flex items-center justify-center text-accent font-bold text-lg">
                            <span>EXPLORE FRAMEWORK</span>
                            <span className="ml-3">→</span>
                          </div>
                        </div>
                        
                        {/* Hovered State - Simplified paragraph */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-in-out p-8 text-center ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <div className="flex justify-center mb-6">
                            <div className="p-5 rounded-full bg-accent/10">
                              <IconComponent className="h-14 w-14 text-accent" />
                            </div>
                          </div>
                          <CardTitle className="text-3xl mb-4 text-primary">
                            {pillar.title}
                          </CardTitle>
                          <p className="text-xl text-accent font-bold mb-6">
                            {pillar.tagline}
                          </p>
                          <CardDescription className="text-base leading-relaxed max-w-md">
                            {pillar.hoverText}
                          </CardDescription>
                          <div className="mt-8 flex items-center justify-center text-accent font-bold text-lg">
                            <span>EXPLORE FRAMEWORK</span>
                            <span className="ml-3">→</span>
                          </div>
                          {/* Learn More CTA - appears on hover */}
                          <div className="mt-4 flex items-center justify-center text-accent font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span>Learn More</span>
                            <span className="ml-3">→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </StaggeredList>
      </div>
    </div>
  );
};

export default FrameworkIntro;
