import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integral Theory | Ishan Parihar",
  description: "Explore the comprehensive framework of Integral Theory for understanding reality through four fundamental perspectives.",
  keywords: [
    "integral theory",
    "consciousness",
    "four quadrants",
    "personal development",
    "spiritual growth",
    "holistic framework",
  ],
};

export default function IntegralTheoryPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            Integral Theory
          </h1>
          <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Content for this section is under development.
          </p>
          <div className="mt-8 h-1 w-24 bg-gradient-to-r from-accent-consciousness to-accent-quantum mx-auto"></div>
        </div>
      </section>
    </main>
  );
}
