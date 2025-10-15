"use client";

import { motion } from "motion/react";

export default function FrameworkPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex justify-center mb-6">
                <div className="border py-2 px-6 text-sm font-medium text-muted-foreground">
                  Consciousness Development Framework
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-primary mb-8">
                Integrated Framework for
                <span className="block text-accent">Conscious Evolution</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                A comprehensive approach to consciousness development that bridges ancient wisdom 
                with modern understanding, providing a clear path for transformative growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display text-primary mb-6">
                A Unified Approach to Growth
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Our framework synthesizes two powerful systems of understanding: Integral Theory's 
                comprehensive map of human development and the Law of One's profound insights into 
                consciousness evolution. Together, they provide a complete roadmap for anyone seeking 
                to understand their place in the cosmos and accelerate their spiritual development.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Framework Components */}
      <section className="py-16 md:py-24 bg-accent/5 dark:bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Integral Theory Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="bg-white dark:bg-black border border-border p-8 md:p-12"
              >
                <div className="mb-6">
                  <div className="inline-block border py-1 px-3 text-sm font-medium text-accent mb-4">
                    Component 1
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold font-display text-primary mb-4">
                    Integral Theory
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Ken Wilber's Integral Theory provides a comprehensive framework for understanding 
                    the full spectrum of human experience and development.
                  </p>
                  
                  <div className="bg-accent/10 border border-accent/20 p-6">
                    <h4 className="font-semibold text-foreground mb-3">Key Elements:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Four Quadrants of Experience</li>
                      <li>• Levels of Development</li>
                      <li>• Lines of Intelligence</li>
                      <li>• States and Stages</li>
                      <li>• Types and Typologies</li>
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground italic">
                      Content development in progress. Detailed exploration coming soon.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Law of One Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="bg-white dark:bg-black border border-border p-8 md:p-12"
              >
                <div className="mb-6">
                  <div className="inline-block border py-1 px-3 text-sm font-medium text-accent mb-4">
                    Component 2
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold font-display text-primary mb-4">
                    Law of One
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    The Ra Material offers profound insights into the nature of consciousness, 
                    spiritual evolution, and our cosmic purpose.
                  </p>
                  
                  <div className="bg-accent/10 border border-accent/20 p-6">
                    <h4 className="font-semibold text-foreground mb-3">Core Concepts:</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Densities of Consciousness</li>
                      <li>• Service to Others vs. Service to Self</li>
                      <li>• The Harvest and Graduation</li>
                      <li>• Chakra System and Energy Centers</li>
                      <li>• Catalyst and Spiritual Evolution</li>
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground italic">
                      Content development in progress. Detailed exploration coming soon.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-display text-primary mb-8">
                The Power of Integration
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12">
                When these two powerful frameworks are integrated, they create a comprehensive 
                map for consciousness development that honors both the practical and mystical 
                dimensions of human experience.
              </p>
              
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 p-8 md:p-12">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
                  Coming Soon: Complete Framework Guide
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We are currently developing comprehensive content that will detail how these 
                  frameworks work together to accelerate your spiritual development. This will 
                  include practical applications, exercises, and guidance for implementing these 
                  principles in your daily life.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
