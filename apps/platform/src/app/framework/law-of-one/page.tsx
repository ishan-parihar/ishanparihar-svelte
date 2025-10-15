import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Law of One | Ishan Parihar",
  description: "Discover the fundamental unity underlying all existence and the journey of consciousness through eight densities of experience.",
  keywords: [
    "law of one",
    "unity consciousness",
    "spiritual evolution",
    "densities",
    "service to others",
    "ancient wisdom",
  ],
};

export default function LawOfOnePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            The Law of One
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
