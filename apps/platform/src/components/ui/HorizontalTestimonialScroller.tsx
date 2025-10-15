"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ServiceTestimonial } from "@/lib/supabase";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

interface HorizontalTestimonialScrollerProps {
  testimonials: ServiceTestimonial[];
  title?: string;
  subtitle?: string;
  sectionTitle?: string;
}

// Transform service testimonials to the format expected by the component
const transformServiceTestimonials = (
  serviceTestimonials: ServiceTestimonial[],
): Testimonial[] => {
  return serviceTestimonials.map((testimonial) => ({
    text: testimonial.testimonial_text,
    image:
      testimonial.client_image ||
      `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face`,
    name: testimonial.client_name,
    role:
      [testimonial.client_title, testimonial.client_company]
        .filter(Boolean)
        .join(", ") || "Client",
  }));
};

export const HorizontalTestimonialScroller = ({
  testimonials,
  title = "What our clients say",
  subtitle = "Discover how individuals from diverse backgrounds have transformed their lives through our guidance and teachings.",
  sectionTitle = "Testimonials",
}: HorizontalTestimonialScrollerProps) => {
  // Transform service testimonials to the expected format
  const transformedTestimonials = transformServiceTestimonials(testimonials);

  // Duplicate testimonials to create seamless loop
  const duplicatedTestimonials = [...transformedTestimonials, ...transformedTestimonials];

  return (
    <section className="bg-background py-16 md:py-24 relative overflow-hidden">
      <div className="container z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-none">{sectionTitle}</div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mt-6 mb-6">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Horizontal Scrolling Container */}
        <div className="relative">
          {/* Gradient masks for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling testimonials */}
          <div className="overflow-hidden">
            <motion.div
              animate={{
                x: "-50%",
              }}
              transition={{
                duration: 60, // Slower for better readability
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }}
              className="flex gap-6 w-fit"
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 p-6 bg-white dark:bg-black border border-border shadow-lg shadow-primary/10 rounded-none"
                >
                  <div className="text-foreground mb-4 leading-relaxed">
                    "{testimonial.text}"
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      width={48}
                      height={48}
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 object-cover rounded-none"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5 text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="leading-5 opacity-60 tracking-tight text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalTestimonialScroller;
