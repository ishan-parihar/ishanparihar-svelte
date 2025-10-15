"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

export function ContactHeroClient() {
  return (
    <section className="min-h-[calc(100vh-60px)] lg:min-h-[calc(100vh-70px)] flex items-center justify-center bg-transparent relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-transparent"></div>

      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </motion.div>

      <motion.div
        className="w-full mx-auto px-4 md:px-6 relative z-10"
        variants={staggerContainer as Variants}
        initial="hidden"
        animate="show"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="text-center md:text-left"
            variants={fadeUp as Variants}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Ready to begin your transformation journey? I'm here to help guide
              you through your personal growth and spiritual development.
            </motion.p>

            {/* Services Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <Link
                href="/offerings"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-none hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                <span>Explore Offerings</span>
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </motion.svg>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            variants={fadeUp as Variants}
            custom={1}
          >
            <motion.div
              className="relative aspect-square rounded-none overflow-hidden shadow-xl ring-2 ring-primary/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/default-contact-hero.jpg"
                alt="Transformation Journey"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-transparent"></div>
            </motion.div>

            {/* Floating elements with enhanced animations */}
            <motion.div
              className="absolute -top-4 -right-4 bg-transparent text-white p-4 rounded-none shadow-lg"
              animate={{
                y: [0, -5, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm">Lives Transformed</div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-transparent text-primary p-4 rounded-none shadow-lg ring-2 ring-primary/20"
              animate={{
                y: [0, 5, 0],
                rotate: [0, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm">Success Rate</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
