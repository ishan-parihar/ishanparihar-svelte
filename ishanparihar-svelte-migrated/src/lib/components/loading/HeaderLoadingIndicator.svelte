<script lang="ts">
  import { loading } from '$lib/stores/loading';
</script>

{#if $loading}
  <div class="absolute top-full left-0 w-full h-0.5 bg-primary animate-pulse"></div>
{/if}