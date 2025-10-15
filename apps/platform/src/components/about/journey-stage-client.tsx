"use client";

import { useRef, ReactElement } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Image from "next/image";

import {
  textReveal,
  textMask,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

// Define the Stage type
interface Stage {
  number: number;
  title: string;
  period: string;
  content: string;
  image: string;
  icon: ReactElement; // Updated from JSX.Element to React.ReactElement
  stats?: {
    [key: string]: string | string[];
  };
}

export function JourneyStageClient({
  stage,
  index,
}: {
  stage: Stage;
  index: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stageProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });

  const stageOpacity = useTransform(
    stageProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0],
  );
  const stageY = useTransform(stageProgress, [0, 1], [50, -50]);
  const stageScale = useTransform(stageProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  // For the image transform
  const imageScale = useTransform(stageProgress, [0, 1], [1, 1.05]);

  return (
    <motion.div
      key={stage.number}
      ref={stageRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className={`relative grid gap-8 md:gap-12 ${
        index % 2 === 0
          ? "md:grid-cols-[1fr_1fr]"
          : "md:grid-cols-[1fr_1fr] md:grid-flow-dense"
      }`}
    >
      <motion.div
        className={`${index % 2 === 1 ? "md:col-start-2" : ""}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative pl-16">
          <motion.div
            className="absolute left-0 top-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 animate-pulse-glow"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 0 rgba(37, 99, 235, 0.4)",
                "0 0 0 20px rgba(37, 99, 235, 0)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {stage.number}
          </motion.div>
          <motion.h3
            variants={textReveal as Variants}
            className="text-2xl font-bold text-gradient mb-3 leading-tight"
          >
            {stage.title}
          </motion.h3>
          <motion.p
            variants={textMask as Variants}
            className="text-sm font-medium text-muted-foreground mb-4"
          >
            {stage.period}
          </motion.p>
          <motion.p
            variants={textMask as Variants}
            className="text-base text-muted-foreground leading-relaxed mb-6"
          >
            {stage.content}
          </motion.p>

          {/* Stage Stats */}
          {stage.stats && (
            <motion.div
              variants={staggerContainer as Variants}
              className="grid grid-cols-3 gap-3 mt-6"
            >
              {Object.entries(stage.stats).map(([key, value]) => (
                <motion.div
                  key={key}
                  variants={staggerItem as Variants}
                  className="glassmorphism rounded-none p-3 text-center hover:scale-105 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="text-xs font-medium text-muted-foreground capitalize">
                    {key}
                  </div>
                  <div className="text-sm font-semibold mt-1">{value}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        className={`${index % 2 === 1 ? "md:col-start-1" : ""}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl glassmorphism group">
          <div className="aspect-square relative">
            <Image
              src={stage.image}
              alt={`Stage ${stage.number}: ${stage.title}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 400px"
              style={{
                transform: `scale(${imageScale.get()})`,
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300">
              {stage.icon}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
