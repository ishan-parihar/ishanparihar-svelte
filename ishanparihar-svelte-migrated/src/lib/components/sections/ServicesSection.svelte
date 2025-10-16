<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Button from '$lib/components/ui/button.svelte';
  import AnimatedServiceCard from '$lib/components/animated-service-card.svelte';

  let {
    services = [],
    isLoading = true,
    error = null,
    title = "Our Services",
    subtitle = "Discover our range of spiritual guidance and personal development offerings",
    showViewAllButton = true,
    viewAllHref = "/offerings",
    maxItems,
  } = $props();

  onMount(async () => {
    // TODO: Fetch services from Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    isLoading = false;
  });

  const displayServices = maxItems ? services.slice(0, maxItems) : services;
</script>

<section class="py-16 bg-background">
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
      <div class="text-center md:text-left mb-6 md:mb-0">
        <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl">
          {subtitle}
        </p>
      </div>

      {#if showViewAllButton && services.length > 0}
        <a href={viewAllHref}>
          <Button variant="outline" size="sm" class="whitespace-nowrap">
            View All Services
          </Button>
        </a>
      {/if}
    </div>

    {#if isLoading}
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {#each Array(3) as _, index}
          <div class="animate-pulse">
            <div class="aspect-[4/3] bg-muted rounded-none mb-3"></div>
            <div class="space-y-2 p-4">
              <div class="h-4 bg-muted rounded w-20"></div>
              <div class="h-5 bg-muted rounded w-3/4"></div>
              <div class="h-4 bg-muted rounded w-full"></div>
              <div class="h-4 bg-muted rounded w-2/3"></div>
              <div class="h-6 bg-muted rounded w-24"></div>
              <div class="h-8 bg-muted rounded w-full"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if error}
      <div class="text-center">
        <div class="bg-destructive/10 border border-destructive/20 rounded-none p-6 max-w-md mx-auto">
          <p class="text-destructive text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            class="mt-4"
            on:click={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    {:else if displayServices.length > 0}
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {#each displayServices as service, index}
          <div in:fly={{ y: 20, duration: 600, delay: index * 100 }} out:fade>
            <AnimatedServiceCard {...service} />
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <svg
              class="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">
            No Services Available
          </h3>
          <p class="text-muted-foreground mb-6">
            We're working on bringing you amazing services. Check back soon!
          </p>
          <a href="/contact">
            <Button variant="outline">Get Notified</Button>
          </a>
        </div>
      </div>
    {/if}
  </div>
</section>