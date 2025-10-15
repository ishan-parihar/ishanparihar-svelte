"use client";

import { motion, Variants } from "framer-motion";
import { textReveal, textMask } from "@/lib/animations";
import { JourneyStageClient } from "./journey-stage-client";
import { ReactElement } from "react";

// Define the Stage type
interface Stage {
  number: number;
  title: string;
  period: string;
  content: string;
  image: string;
  slotId: string;
  icon: ReactElement; // Updated from JSX.Element to React.ReactElement
  stats?: {
    [key: string]: string | string[];
  };
}

interface AboutJourneyClientProps {
  stages: Stage[];
}

export function AboutJourneyClient({ stages }: AboutJourneyClientProps) {
  return (
    <section id="journey" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background opacity-50"></div>
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="w-full relative mx-auto px-4 md:px-6">
        <motion.div
          variants={textReveal as Variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto mb-24 max-w-3xl text-center"
        >
          <motion.p
            variants={textMask as Variants}
            className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4"
          >
            From Trauma to Transformation
          </motion.p>
          <motion.h2
            variants={textReveal as Variants}
            className="text-4xl md:text-5xl font-bold text-gradient mb-8 leading-tight"
          >
            A Journey of Awakening
          </motion.h2>
          <motion.p
            variants={textMask as Variants}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            Ishan Parihar is more than a guide to self-actualization,
            productivity, and spiritual evolution. He is a testament to the
            power of human resilience and the boundless potential that resides
            within each of us. Through his profound understanding of{" "}
            <strong className="text-primary">Integral Theory</strong>, the{" "}
            <strong className="text-primary">Law of One</strong>, and a deep
            dive into the human psyche, Ishan has transformed his own life from
            the depths of despair to the heights of conscious living.
          </motion.p>
        </motion.div>

        {/* Journey stages */}
        <div className="space-y-24">
          {stages.map((stage, index) => (
            <JourneyStageClient
              key={stage.number}
              stage={stage}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
