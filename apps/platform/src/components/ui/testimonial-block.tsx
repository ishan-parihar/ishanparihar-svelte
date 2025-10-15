import { motion } from "framer-motion";
import Image from "next/image";

export const TestimonialBlock = () => {
  return (
    <div className="h-[450px] rounded-lg overflow-hidden relative">
      {/* Background image */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg" />
      
      {/* Testimonial content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-10">
        <div>
          <div className="text-5xl md:text-6xl font-serif text-primary/20 mb-4">"</div>
          <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-6">
            In three months, I achieved a level of clarity I hadn't found in ten years.
          </blockquote>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">James W.</div>
              <div className="text-muted-foreground">From Founder Burnout to Renewed Purpose</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <motion.div
        className="absolute top-4 right-4 w-24 h-24 rounded-full bg-primary/10"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-accent/10"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
};