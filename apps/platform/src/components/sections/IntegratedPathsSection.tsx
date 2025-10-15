"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Heart, 
  Zap,
  Users,
  Mountain,
  Handshake,
  Sparkles
} from "lucide-react";
import { PathOffering } from "@/queries/pathOfferingsQueriesServer";
import Image from "next/image";
import { trackCtaClick } from "@/lib/analytics";

interface PathOfferingCardProps {
  offering: PathOffering;
  index: number;
}

const PathIconMap = {
  "Mastery & Achievement": Target,
  "Connection & Intimacy": Heart,
  "Purpose & Transcendence": Sparkles,
};

const PathColorMap = {
  "Mastery & Achievement": "from-blue-500 to-purple-600",
  "Connection & Intimacy": "from-pink-500 to-rose-600",
  "Purpose & Transcendence": "from-amber-500 to-orange-600",
};

const PathOfferingCard: React.FC<PathOfferingCardProps> = ({ offering, index }) => {
  const IconComponent = PathIconMap[offering.path || "Mastery & Achievement"] || Target;
  const gradientClass = PathColorMap[offering.path || "Mastery & Achievement"] || "from-blue-500 to-purple-600";
  
  // All cards have the same size now for consistency
  const isHeroCard = false;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={`overflow-hidden h-full flex flex-col group hover:shadow-xl transition-all duration-300 border-0`}>
        <div className="relative h-48">
          {offering.cover_image ? (
            <Image
              src={offering.cover_image}
              alt={offering.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
              <IconComponent className="w-12 h-12 text-neutral-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className={`bg-gradient-to-r ${gradientClass} border-0 text-white hover:opacity-90`}>
              <IconComponent className="w-3 h-3 mr-1" />
              {offering.path}
            </Badge>
          </div>
        </div>
        
        <CardContent className="flex-1 flex flex-col p-6">
          <div className="flex-1">
            <h3 className={`font-bold text-xl mb-2 group-hover:text-accent transition-colors`}>
              {offering.title}
            </h3>
            <p className={`text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-3`}>
              {offering.excerpt}
            </p>
          </div>
          
          <div className="mt-auto">
            <Button 
              asChild 
              className={`w-full bg-gradient-to-r ${gradientClass} border-0 hover:opacity-90 transition-opacity`}
              size="default"
              onClick={() => trackCtaClick(`Learn More - ${offering.path}`, "Integrated Paths Section")}
            >
              <Link href={`/offerings/${offering.slug}`}>
                Learn More
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface IntegratedPathsSectionProps {
  offerings: PathOffering[];
}

const IntegratedPathsSection: React.FC<IntegratedPathsSectionProps> = ({ offerings }) => {
  // Log what we're receiving
  console.log("[IntegratedPathsSection] Received offerings:", offerings);
  
  // If we don't have exactly 3 offerings, show a message
  if (offerings.length === 0) {
    return (
      <section className="w-full py-20 md:py-32 flex items-center justify-center">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Path to Transformation</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            Discover offerings aligned with your core motivations and aspirations.
          </p>
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-8 max-w-md mx-auto">
            <Mountain className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No offerings are currently available for the archetypal paths. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 md:py-24 flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            ARCHETYPAL PATHWAYS
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Your Journey to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Wholeness</span>
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            Connect your deepest motivations to transformative offerings designed for your unique path.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offerings.map((offering, index) => (
            <PathOfferingCard 
              key={offering.id} 
              offering={offering} 
              index={index} 
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/offerings">
              View All Offerings
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IntegratedPathsSection;