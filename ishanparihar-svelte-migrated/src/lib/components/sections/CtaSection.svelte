<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import ShuffleHero from "$lib/components/ui/ShuffleHero.svelte";
  import TestimonialBlock from "$lib/components/ui/TestimonialBlock.svelte";
  import AnimatedSection from "$lib/components/motion/AnimatedSection.svelte";
  import InteractiveButton from "$lib/components/motion/InteractiveButton.svelte";
  import FocusEnhancer from "$lib/components/ui/FocusEnhancer.svelte";
  import AmbientLight from "$lib/components/ui/AmbientLight.svelte";
  import { Shield } from "lucide-svelte";

  let {
    title = "Ready to Transform Your Life?",
    description = "Take the first step towards a more conscious, purposeful life. Join our community of seekers and discover the tools, guidance, and support you need to unlock your full potential.",
    primaryButtonText = "Schedule a Consultation",
    primaryButtonLink = "/#contact",
    secondaryButtonText = "Explore Services",
    secondaryButtonLink = "/offerings",
    imageUrl = "https://ext.same-assets.com/3349622857/1359213608.jpeg",
    imageAlt = "Transformation Journey",
    stats = [
      { label: "Years Experience", value: "5+" },
      { label: "Countries Reached", value: "50+" },
      { label: "YouTube Subscribers", value: "10K+" },
      { label: "Instagram Followers", value: "25K+" },
    ],
  } = $props();

  function trackCtaClick(buttonText: string, section: string) {
    // TODO: Implement analytics
    console.log("trackCtaClick", buttonText, section);
  }
</script>

<section class="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
  <AmbientLight color="rgba(125, 211, 252, 0.1)" intensity={0.2} size={500} speed={0.4} />

  <AnimatedSection class="w-full h-full mx-auto relative z-10 flex flex-col items-center justify-center">
    <FocusEnhancer intensity={2}>
      <ShuffleHero
        {title}
        subtitle="Limited Consultation Slots Available This Month"
        {description}
        buttonText={primaryButtonText}
        buttonLink={primaryButtonLink}
        onButtonClick={() => trackCtaClick(primaryButtonText, "Final CTA Section")}
        rightColumn={TestimonialBlock}
      />
    </FocusEnhancer>

    <AnimatedSection delay={0.1} class="flex justify-center mt-6">
      <div class="flex items-start max-w-2xl mx-auto p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
        <Shield class="flex-shrink-0 w-5 h-5 text-primary mt-0.5 mr-3" />
        <p class="text-sm text-muted-foreground">
          <span class="font-medium text-foreground">Our Commitment To You:</span> If you don't find immense value in our initial consultation, it's on us. No cost, no risk.
        </p>
      </div>
    </AnimatedSection>

    <AnimatedSection delay={0.2} class="flex justify-center mt-8">
      <div>
        <a href={secondaryButtonLink}>
          <InteractiveButton
            class="rounded-none px-8 py-6 text-lg border-2 border-neutral-800 hover:bg-neutral-100 text-neutral-900 dark:border-white dark:hover:bg-white/10 dark:text-white transition-all duration-300 bg-transparent relative overflow-hidden"
            onClick={() => trackCtaClick(secondaryButtonText, "Final CTA Section")}
          >
            {secondaryButtonText}
          </InteractiveButton>
        </a>
      </div>
    </AnimatedSection>

    {#if stats && stats.length > 0}
      <AnimatedSection
        delay={0.4}
        class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-8"
      >
        {#each stats as stat, index}
          <div class="text-center">
            <div class="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              {stat.value}
            </div>
            <div class="text-sm text-neutral-700 dark:text-neutral-300">
              {stat.label}
            </div>
          </div>
        {/each}
      </AnimatedSection>
    {/if}
  </AnimatedSection>
</section>