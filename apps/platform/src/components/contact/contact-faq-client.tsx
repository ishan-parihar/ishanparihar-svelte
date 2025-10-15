"use client";

import { motion, Variants } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

export function ContactFaqClient() {
  return (
    <section className="py-16 md:py-20 bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-transparent"></div>

      <motion.div
        className="w-full mx-auto px-4 md:px-6 relative z-10"
        variants={staggerContainer as Variants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          variants={fadeUp as Variants}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg md:text-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            Find answers to common questions about working with me and starting
            your transformation journey.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            className="bg-transparent rounded-none p-6 shadow-sm relative overflow-hidden group ring-2 ring-primary/20"
            variants={fadeUp as Variants}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative illustration */}
            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <pattern
                  id="dots"
                  width="5"
                  height="5"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2.5" cy="2.5" r="1" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#dots)" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3">
                What can I expect from a session?
              </h3>
              <p className="text-muted-foreground">
                Each session is tailored to your unique needs and goals. We'll
                work together to identify your challenges, develop practical
                solutions, and create a personalized path for your growth.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="bg-transparent rounded-none p-6 shadow-sm relative overflow-hidden group ring-2 ring-primary/20"
            variants={fadeUp as Variants}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative illustration */}
            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <pattern
                  id="waves"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 0 10 Q 5 0, 10 10 T 20 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
                <rect width="100" height="100" fill="url(#waves)" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3">
                How long are the sessions?
              </h3>
              <p className="text-muted-foreground">
                Sessions typically last 60-90 minutes, depending on your needs
                and the type of guidance you're seeking. We can adjust the
                duration based on your specific requirements.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="bg-transparent rounded-none p-6 shadow-sm relative overflow-hidden group ring-2 ring-primary/20"
            variants={fadeUp as Variants}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative illustration */}
            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <pattern
                  id="circles"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="5" cy="5" r="2" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#circles)" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3">
                Do you offer online sessions?
              </h3>
              <p className="text-muted-foreground">
                Yes, I offer both in-person and online sessions to accommodate
                your location and preferences. Online sessions are conducted via
                secure video conferencing.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="bg-transparent rounded-none p-6 shadow-sm relative overflow-hidden group ring-2 ring-primary/20"
            variants={fadeUp as Variants}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Decorative illustration */}
            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <pattern
                  id="squares"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="4" height="4" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#squares)" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                I accept all major credit cards, bank transfers, and digital
                payment methods. Payment details will be provided when you
                schedule your session.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
