<script lang="ts">
  import Badge from "$lib/components/ui/badge.svelte";
  import { Star } from "lucide-svelte";
  import StaticEngagementMetrics from "./StaticEngagementMetrics.svelte";
  import CoverImage from "../optimized/CoverImage.svelte";
  import BookmarkButton from "./BookmarkButton.svelte";

  let {
    id,
    title,
    excerpt,
    coverImage,
    date,
    category,
    slug,
    index = 0,
    premium = false,
    likes_count = 0,
    comments_count = 0,
    views_count = 0,
    content_type = "blog",
    recommendation_tags = [],
  } = $props();

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<a href={`/blog/${slug}`} class="block h-full">
  <div class="group overflow-hidden h-full hover:shadow-sm transition-all duration-300 bg-white dark:bg-black">
    <div class="relative aspect-[3/2] overflow-hidden">
      <CoverImage src={coverImage} alt={title} class="transition-transform duration-300 group-hover:scale-102" priority={index < 3} />
      <div class="absolute inset-0 bg-transparent" />
    </div>

    <div class="p-4 sm:p-6 border border-border border-t-0">
      <div class="flex items-center justify-between mb-2 sm:mb-3">
        <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <Badge variant="outline" class="font-medium text-xs px-2 py-1">
            {category}
          </Badge>
          {#if content_type === "research_paper"}
            <Badge variant="outline" class="font-medium text-xs px-2 py-1">
              RESEARCH
            </Badge>
          {/if}
          {#if premium}
            <Badge variant="default" class="font-medium text-xs px-2 py-1 flex items-center gap-1">
              <Star class="w-3 h-3" />
              Premium
            </Badge>
          {/if}
          <span class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {formattedDate}
          </span>
        </div>

        {#if id}
          <div on:click|stopPropagation|preventDefault={() => {}}>
            <BookmarkButton postId={id} postTitle={title} size="sm" />
          </div>
        {/if}
      </div>

      <h3 class="text-lg sm:text-xl font-heading font-bold mb-1.5 sm:mb-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200 line-clamp-2 text-neutral-900 dark:text-white">
        {title}
      </h3>

      <p class="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3 mb-3 sm:mb-4 font-body">
        {excerpt}
      </p>

      <div class="flex items-center justify-between">
        <StaticEngagementMetrics
          likesCount={likes_count}
          commentsCount={comments_count}
          viewsCount={views_count}
          className="gap-2"
        />

        {#if recommendation_tags && recommendation_tags.length > 0}
          <div class="flex items-center gap-1">
            {#each recommendation_tags.slice(0, 2) as tag}
              <Badge variant="secondary" class="text-xs px-1.5 py-0.5 font-normal">
                {tag}
              </Badge>
            {/each}
            {#if recommendation_tags.length > 2}
              <Badge variant="secondary" class="text-xs px-1.5 py-0.5 font-normal">
                +{recommendation_tags.length - 2}
              </Badge>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</a>
