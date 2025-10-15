import { CtaSectionClient } from "@/components/sections/cta-section-client";

export function CTASection() {
  const stats = [
    { label: "Years Experience", value: "5+" },
    { label: "Countries Reached", value: "50+" },
    { label: "YouTube Subscribers", value: "10K+" },
    { label: "Instagram Followers", value: "25K+" },
  ];

  return (
    <CtaSectionClient
      title="Ready to Transform Your Life?"
      description="Take the first step towards a more conscious, purposeful life. Join our community of seekers and discover the tools, guidance, and support you need to unlock your full potential."
      primaryButtonText="Schedule a Consultation"
      primaryButtonLink="/contact"
      secondaryButtonText="Explore Offerings"
      secondaryButtonLink="/offerings"
      imageUrl="https://ext.same-assets.com/3349622857/1359213608.jpeg"
      imageAlt="Transformation Journey"
      stats={stats}
    />
  );
}
