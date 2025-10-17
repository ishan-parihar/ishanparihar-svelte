<script lang="ts">
  import { Star, Share2 } from 'lucide-svelte'; // Assuming lucide-svelte is installed

  export let title: string;
  export let excerpt: string;
  export let coverImage: string;
  export let date: string;
  export let category: string;
  export let slug: string;
  export let premium: boolean = false;
  export let likes_count: number = 0;
  export let comments_count: number = 0;
  export let views_count: number = 0;
  export let content_type: "blog" | "research_paper" = "blog";

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getBlogImage = (coverImageUrl: string): string => {
    let imageUrl = coverImageUrl || "/default-blog-image.jpg";
    if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
      return imageUrl;
    } else {
      return "/default-blog-image.jpg";
    }
  };

  const imageSrc = getBlogImage(coverImage);

  async function handleShareClick(e: MouseEvent) {
    e.stopPropagation();
    const shareData = {
      title: title,
      text: excerpt,
      url: `${window.location.origin}/blog/${slug}`,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Failed to share or copy link:", clipboardError);
        alert("Failed to share post. Please try again.");
      }
    }
  }
</script>

<a href={`/blog/${slug}`}>
  <div class="group overflow-hidden h-full hover:shadow-sm transition-all duration-300 bg-card border border-border rounded-none">
    <div class="relative aspect-[3/2] overflow-hidden">
      <img src={imageSrc} alt={title} class="transition-transform duration-300 group-hover:scale-102 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-transparent"></div>
    </div>
    <div class="p-4 sm:p-6 border-t-0">
      <div class="flex items-center justify-between mb-2 sm:mb-3">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="px-3 py-1.5 text-xs font-ui font-medium border border-border text-foreground rounded-none">
            {category}
          </span>
          {#if content_type === "research_paper"}
            <span class="px-3 py-1.5 text-xs font-ui font-medium border border-border text-foreground rounded-none">
              RESEARCH
            </span>
          {/if}
          {#if premium}
            <span class="font-ui font-medium text-xs flex items-center gap-1">
              <Star class="w-3 h-3" />
              Premium
            </span>
          {/if}
          <span class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {formattedDate}
          </span>
        </div>
      </div>
      <h3 class="text-lg sm:text-xl font-heading font-bold mb-1.5 sm:mb-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-200 line-clamp-2 text-neutral-900 dark:text-white">
        {title}
      </h3>
      <p class="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3 mb-3 sm:mb-4 font-body">
        {excerpt}
      </p>

      <div class="mb-3 sm:mb-4 flex items-center justify-between">
        <!-- Engagement metrics would go here -->
        <div class="text-xs gap-1.5 sm:gap-2">
            Likes: {likes_count} Views: {views_count} Comments: {comments_count}
        </div>
        <button on:click={handleShareClick} class="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors duration-200" title="Share post">
          <Share2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</a>
