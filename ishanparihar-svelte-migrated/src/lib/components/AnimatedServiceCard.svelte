<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import Badge from '$lib/components/ui/badge.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import CoverImage from '$lib/components/optimized/CoverImage.svelte';
  import LinkLoadingWrapper from '$lib/components/loading/LinkLoadingWrapper.svelte';
  import { Star, Clock, Users, Eye, MessageSquare, ArrowRight, Sparkles, Crown } from 'lucide-svelte';

  let {
    id,
    title,
    excerpt,
    coverImage,
    category,
    serviceType,
    basePrice,
    currency,
    pricingType,
    billingPeriod,
    featured,
    premium,
    slug,
    index = 0,
    viewsCount = 0,
    inquiriesCount = 0,
    bookingsCount = 0,
  } = $props();

  const formatPrice = () => {
    if (!basePrice) return "Contact for pricing";

    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(basePrice);

    if (pricingType === "recurring" && billingPeriod) {
      const periodMap = {
        monthly: "/month",
        yearly: "/year",
        weekly: "/week",
        daily: "/day",
      };
      return `${formattedPrice}${periodMap[billingPeriod]}`;
    }

    return formattedPrice;
  };

  const getServiceTypeInfo = () => {
    const typeMap = {
      product: {
        label: "Product",
        color: "bg-accent/10 text-accent border-accent/20",
      },
      service: {
        label: "Service",
        color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      },
      course: {
        label: "Course",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      },
      consultation: {
        label: "Consultation",
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      },
    };
    return typeMap[serviceType];
  };

  const serviceTypeInfo = getServiceTypeInfo();
</script>

<div class="relative h-full AnimatedServiceCard" in:fly={{ y: 20, duration: 500, delay: index * 100 }} out:fade>
  <LinkLoadingWrapper href={`/offerings/${slug}`} showIndicator={true} class="block">
    <div class="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border border-border rounded-none">
      <div class="relative aspect-[4/3] overflow-hidden">
        <CoverImage src={coverImage} alt={title} class="transition-transform duration-300 group-hover:scale-105" priority={index < 3} />

        <div class="absolute top-3 left-3 flex flex-wrap gap-2">
          {#if featured}
            <Badge class="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 border-0">
              <Sparkles class="h-3 w-3 mr-1" />
              Featured
            </Badge>
          {/if}
          {#if premium}
            <Badge class="bg-purple-600 text-white dark:bg-purple-400 dark:text-black hover:bg-purple-700 dark:hover:bg-purple-500 border-0">
              <Crown class="h-3 w-3 mr-1" />
              Premium
            </Badge>
          {/if}
        </div>

        <div class="absolute top-3 right-3">
          <Badge variant="outline" class={serviceTypeInfo.color}>
            {serviceTypeInfo.label}
          </Badge>
        </div>
      </div>

      <div class="p-4 flex flex-col">
        {#if category}
          <div class="mb-2">
            <Badge variant="outline" class="text-xs border-border/50 text-muted-foreground hover:border-border hover:text-foreground transition-colors">
              {category.name}
            </Badge>
          </div>
        {/if}

        <h3 class="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
          {title}
        </h3>

        <p class="text-muted-foreground text-sm mb-3 line-clamp-2">
          {excerpt}
        </p>

        <div class="mb-2">
          <div class="text-xl font-bold text-foreground">
            {formatPrice()}
          </div>
          {#if pricingType === "custom"}
            <div class="text-sm text-muted-foreground">
              Custom pricing available
            </div>
          {/if}
        </div>

        <div class="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div class="flex items-center gap-4">
            {#if viewsCount > 0}
              <div class="flex items-center gap-1">
                <Eye class="h-3 w-3" />
                <span>{viewsCount}</span>
              </div>
            {/if}
            {#if inquiriesCount > 0}
              <div class="flex items-center gap-1">
                <MessageSquare class="h-3 w-3" />
                <span>{inquiriesCount}</span>
              </div>
            {/if}
            {#if bookingsCount > 0}
              <div class="flex items-center gap-1">
                <Users class="h-3 w-3" />
                <span>{bookingsCount}</span>
              </div>
            {/if}
          </div>
        </div>

        <Button variant="outline" class="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-300">
          <span>
            {serviceType === "consultation"
              ? "Book Consultation"
              : serviceType === "course"
                ? "Explore Course"
                : serviceType === "product"
                  ? "View Product"
                  : "Explore Service"}
          </span>
          <ArrowRight class="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  </LinkLoadingWrapper>
</div>
