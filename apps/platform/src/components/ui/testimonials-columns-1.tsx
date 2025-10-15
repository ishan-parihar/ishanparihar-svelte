"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { FocusEnhancer } from "@/components/ui/focus-enhancer";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => {
                const itemIndex = index * props.testimonials.length + i;
                return (
                  <motion.div
                    className="p-10 rounded-none border shadow-lg shadow-primary/10 max-w-xs w-full cursor-pointer"
                    key={itemIndex}
                    onMouseEnter={() => setHoveredIndex(itemIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileHover={{ 
                      y: -10,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <FocusEnhancer intensity={0.5}>
                      <motion.div
                        animate={hoveredIndex === itemIndex ? { scale: 1.02 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <motion.div
                            animate={hoveredIndex === itemIndex ? { opacity: 1 } : { opacity: 0.8 }}
                            transition={{ duration: 0.3 }}
                          >
                            {text}
                          </motion.div>
                        </div>
                        <div className="flex items-center gap-2 mt-5">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Image
                              width={40}
                              height={40}
                              src={image}
                              alt={name}
                              className="h-10 w-10 rounded-full"
                            />
                          </motion.div>
                          <div className="flex flex-col">
                            <motion.div 
                              className="font-medium tracking-tight leading-5"
                              animate={hoveredIndex === itemIndex ? { x: 5 } : { x: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {name}
                            </motion.div>
                            <div className="leading-5 opacity-60 tracking-tight">
                              {role}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </FocusEnhancer>
                  </motion.div>
                );
              })}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

// Note: This component is used by new-testimonials-section.tsx
// The testimonials data is defined in that file, not here
