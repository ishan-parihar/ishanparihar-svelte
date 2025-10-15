import { ConsciousnessEvolutionHero } from "./sections/consciousness-evolution-hero";

export function SimpleHeroSection() {
  return (
    <ConsciousnessEvolutionHero
      title="Consciousness Evolution Protocol"
      subtitle="Access the quantum leap in human development that 99.7% haven't discovered"
      animatedWords={[
        "consciousness",
        "evolution",
        "transformation",
        "awakening",
        "transcendence",
      ]}
      description="Proprietary consciousness acceleration technology for the next stage of human evolution. Join the evolutionary pioneers accessing advanced protocols for consciousness expansion."
      primaryButtonText="Initialize Protocol"
      primaryButtonLink="#path-section"
      secondaryButtonText="View Demonstration"
      secondaryButtonLink="/about"
      topButtonText="Latest Consciousness Research"
      topButtonLink="/blog"
      stats={[
        { value: "99.7%", label: "Undiscovered by humanity" },
        { value: "∞", label: "Consciousness potential" },
        { value: "2025", label: "Evolution acceleration year" },
      ]}
    />
  );
}
