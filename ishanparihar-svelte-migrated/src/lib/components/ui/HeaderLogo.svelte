<script lang="ts">
  import BrandLogo from './BrandLogo.svelte';

  let { className }: { className?: string } = $props();
</script>

<BrandLogo size="md" {className} href="/" />