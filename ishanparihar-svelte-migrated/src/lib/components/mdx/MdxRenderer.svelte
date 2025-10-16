<script lang="ts">
  import { compile } from 'mdsvex';

  export let source: string;

  let html: string | null = null;

  async function render() {
    if (source) {
      const result = await compile(source);
      html = result?.code || null;
    }
  }

  $: {
    render();
  }
</script>

{#if html}
  {@html html}
{:else}
  <p>Loading content...</p>
{/if}
