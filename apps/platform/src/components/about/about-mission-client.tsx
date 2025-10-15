"use client";

import { motion, Variants } from "framer-motion";
import { textReveal, textMask } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutMissionClient() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="w-full relative mx-auto px-4 md:px-6">
        <motion.div
          variants={textReveal as Variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p
            variants={textMask as Variants}
            className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4"
          >
            MY MISSION
          </motion.p>
          <motion.h2
            variants={textReveal as Variants}
            className="text-4xl md:text-5xl font-bold text-gradient mb-8 leading-tight"
          >
            Elevating Consciousness, Transforming Lives
          </motion.h2>
          <motion.p
            variants={textMask as Variants}
            className="text-xl text-muted-foreground leading-relaxed mb-12"
          >
            My mission is to empower you to break free from the shackles of
            limiting beliefs, societal conditioning, and internal barriers. It's
            about guiding you on a journey of self-discovery, helping you unlock
            your inherent potential, and enabling you to live a life of purpose,
            authenticity, and deep fulfillment.
          </motion.p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/events">
              <Button className="rounded-full bg-primary px-12 py-6 text-lg text-white hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Join My Movement
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
