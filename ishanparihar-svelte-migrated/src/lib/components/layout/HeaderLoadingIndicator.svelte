<script lang="ts">
  import { navigating } from '$app/stores';
  import { slide } from 'svelte/transition';
</script>

{#if $navigating}
  <div transition:slide={{duration: 400, easing: (t) => t}}
    class="absolute bottom-0 left-0 h-0.5 bg-accent"
    style="width: 100%;"
  ></div>
{/if}