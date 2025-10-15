"use client";

import { motion, Variants } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function AboutCtaClient() {
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>

      <motion.div
        className="w-full mx-auto px-4 md:px-6 relative z-10"
        variants={staggerContainer as Variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="text-center md:text-left"
            variants={fadeUp as Variants}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Begin Your Journey of Transformation
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8">
              Take the first step towards a more conscious, purposeful life.
              Join our community of seekers and discover the tools, guidance,
              and support you need to unlock your full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/#contact">
                <Button className="w-full sm:w-auto rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                  Schedule a Consultation
                </Button>
              </Link>
              <Link href="/offerings">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-lg border-2 hover:bg-primary/10 transition-all duration-300"
                >
                  Explore Offerings
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            variants={fadeUp as Variants}
            custom={1}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://ext.same-assets.com/3349622857/1359213608.jpeg"
                alt="Transformation Journey"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent"></div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-primary text-white p-4 rounded-none shadow-lg"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm">Lives Transformed</div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-white dark:bg-card text-primary p-4 rounded-none shadow-lg"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm">Success Rate</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Social proof */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={fadeUp as Variants}
          custom={2}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">5+</div>
            <div className="text-sm text-muted-foreground">
              Years Experience
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-sm text-muted-foreground">
              Countries Reached
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">
              YouTube Subscribers
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">25K+</div>
            <div className="text-sm text-muted-foreground">
              Instagram Followers
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
