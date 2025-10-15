import React from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const timelineData: TimelineEntry[] = [
  {
    title: "2018",
    content: (
      <div className="space-y-4">
        <h4 className="font-display text-xl font-semibold text-foreground">
          The Awakening
        </h4>
        <p className="font-sans text-base leading-relaxed text-muted-foreground">
          The journey began with a profound spiritual awakening that shifted
          everything. What started as a personal crisis became the catalyst for
          deep exploration into consciousness, meaning, and the nature of
          reality itself.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="px-3 py-1 bg-accent-consciousness/20 text-accent-consciousness rounded-full text-sm font-medium">
            Spiritual Awakening
          </span>
          <span className="px-3 py-1 bg-accent-quantum/20 text-accent-quantum rounded-full text-sm font-medium">
            Consciousness Research
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "2019",
    content: (
      <div className="space-y-4">
        <h4 className="font-display text-xl font-semibold text-foreground">
          Deep Study & Integration
        </h4>
        <p className="font-sans text-base leading-relaxed text-muted-foreground">
          Immersed in the study of Integral Theory, the Law of One, and
          traditional Indian philosophical systems. This year was about building
          the theoretical foundation that would later become the framework for
          conscious evolution.
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground font-sans">
          <li>Completed intensive study of Ken Wilber's Integral Theory</li>
          <li>Deep dive into the Ra Material (Law of One)</li>
          <li>Exploration of Vedantic and Tantric traditions</li>
        </ul>
      </div>
    ),
  },
  {
    title: "2021",
    content: (
      <div className="space-y-4">
        <h4 className="font-display text-xl font-semibold text-foreground">
          Framework Development
        </h4>
        <p className="font-sans text-base leading-relaxed text-muted-foreground">
          The synthesis began to take shape. Drawing from years of study and
          personal practice, the first iterations of the Conscious Evolution
          Framework emerged, specifically designed for the modern Indian
          context.
        </p>
        <div className="bg-card/50 border border-border rounded-lg p-4 mt-4">
          <p className="font-sans text-sm text-muted-foreground italic">
            "The framework needed to honor ancient wisdom while addressing
            contemporary challenges. It had to be practical, not just
            philosophical."
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "2022",
    content: (
      <div className="space-y-4">
        <h4 className="font-display text-xl font-semibold text-foreground">
          Community & Teaching
        </h4>
        <p className="font-sans text-base leading-relaxed text-muted-foreground">
          Began sharing the framework through workshops, one-on-one coaching,
          and community building. The response was overwhelming - people were
          hungry for this kind of integrated approach to personal and spiritual
          development.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-accent-evolution/10 rounded-lg">
            <div className="font-display text-2xl font-bold text-accent-evolution">
              50+
            </div>
            <div className="text-sm text-muted-foreground">
              Workshops Conducted
            </div>
          </div>
          <div className="text-center p-3 bg-accent-energy/10 rounded-lg">
            <div className="font-display text-2xl font-bold text-accent-energy">
              200+
            </div>
            <div className="text-sm text-muted-foreground">
              Lives Transformed
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "2024",
    content: (
      <div className="space-y-4">
        <h4 className="font-display text-xl font-semibold text-foreground">
          Digital Platform Launch
        </h4>
        <p className="font-sans text-base leading-relaxed text-muted-foreground">
          The vision expanded beyond in-person interactions. This platform
          represents the culmination of years of development - a comprehensive
          digital space for conscious evolution, community building, and
          transformative learning.
        </p>
        <div className="flex items-center space-x-4 mt-4 p-4 bg-gradient-to-r from-accent-consciousness/10 to-accent-quantum/10 rounded-lg border border-accent-consciousness/20">
          <div className="w-3 h-3 bg-accent-evolution rounded-full animate-pulse"></div>
          <p className="font-sans text-sm font-medium text-foreground">
            Currently serving seekers worldwide with integrated wisdom and
            practical tools
          </p>
        </div>
      </div>
    ),
  },
];
