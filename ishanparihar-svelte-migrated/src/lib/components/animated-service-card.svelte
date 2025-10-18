<script lang="ts">
  import type { ProductService } from '$lib/types/supabase';
  import { Star, Clock, Users, Eye, MessageSquare, ArrowRight, Sparkles, Crown } from 'lucide-svelte';
  import { fly } from 'svelte/transition';
  import Badge from '$lib/components/ui/Badge.svelte';

  let { service, index }: { service: ProductService; index: number; } = $props<{
    service: ProductService;
    index: number;
  }>();

  function formatPrice() {
    if (!service.base_price) return "Contact for pricing";

    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: service.currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(service.base_price);

    if (service.pricing_type === "recurring" && service.billing_period) {
      const periodMap: Record<string, string> = {
        monthly: "/month",
        yearly: "/year",
        weekly: "/week",
        daily: "/day",
      };
      return `${formattedPrice}${periodMap[service.billing_period as string]}`;
    }

    return formattedPrice;
  }

  const serviceTypeInfo = ({
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
  } as const)[service.service_type as 'product' | 'service' | 'course' | 'consultation'];

</script>

<div in:fly={{ y: 20, duration: 500, delay: index * 100 }} class="relative h-full AnimatedServiceCard">
  <a href={`/offerings/${service.slug}`} class="block">
    <div class="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border border-border rounded-none">
      <div class="relative aspect-[4/3] overflow-hidden">
        <img src={service.cover_image} alt={service.title} class="transition-transform duration-300 group-hover:scale-105 w-full h-full object-cover" />
        <div class="absolute top-3 left-3 flex flex-wrap gap-2">
          {#if service.featured}
            <Badge class="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 border-0">
              <Sparkles class="h-3 w-3 mr-1" />
              Featured
            </Badge>
          {/if}
          {#if service.premium}
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
         {#if service.category}
           <div class="mb-2">
             <span class="px-2 py-1 text-xs border border-border/50 text-muted-foreground hover:border-border hover:text-foreground transition-colors rounded">
               {service.category.name}
             </span>
           </div>
         {/if}
         <h3 class="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
           {service.title}
         </h3>
         <p class="text-muted-foreground text-sm mb-3 line-clamp-2">
           {service.excerpt}
         </p>
         <div class="mb-2">
           <div class="text-xl font-bold text-foreground">
             {formatPrice()}
           </div>
           {#if service.pricing_type === 'custom'}
             <div class="text-sm text-muted-foreground">
               Custom pricing available
             </div>
           {/if}
         </div>
         <div class="flex items-center justify-between text-xs text-muted-foreground mb-2">
           <div class="flex items-center gap-4">
             {#if service.views_count > 0}
               <div class="flex items-center gap-1">
                 <Eye class="h-3 w-3" />
                 <span>{service.views_count}</span>
               </div>
             {/if}
             {#if service.inquiries_count > 0}
               <div class="flex items-center gap-1">
                 <MessageSquare class="h-3 w-3" />
                 <span>{service.inquiries_count}</span>
               </div>
             {/if}
             {#if service.bookings_count > 0}
               <div class="flex items-center gap-1">
                 <Users class="h-3 w-3" />
                 <span>{service.bookings_count}</span>
               </div>
             {/if}
           </div>
         </div>
         <button class="w-full border border-border rounded-sm p-2 group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all duration-300">
           <span>
             {service.service_type === 'consultation' ? 'Book Consultation' : service.service_type === 'course' ? 'Explore Course' : service.service_type === 'product' ? 'View Product' : 'Explore Service'}
           </span>
           <ArrowRight class="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform inline-block" />
         </button>
       </div>
    </div>
  </a>
</div>
